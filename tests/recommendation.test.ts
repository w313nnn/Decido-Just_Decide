import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { getRecommendation } from '../src/services/recommendationEngine';
import { SUNGAI_LONG_FOOD_DATABASE } from '../src/data/sungaiLongFood';
import { savePreferences, getPreferences } from '../src/services/preferencesService';
import { setStorageOwner, writeStored } from '../src/services/storage';
import { getHistory, saveDecision, clearAllHistory, getDaysAgo, mergeHistory } from '../src/services/historyService';
import { parsePromptLocally } from '../src/services/aiHelperService';

const data = new Map<string,string>();
Object.defineProperty(globalThis, 'localStorage', { value: {
  getItem: (key: string) => data.get(key) ?? null,
  setItem: (key: string, value: string) => data.set(key,value),
}, configurable: true });
beforeEach(() => { data.clear();setStorageOwner(); });

test('cloud snapshots preserve pending local saves and deletions', () => {
  const record = saveDecision(SUNGAI_LONG_FOOD_DATABASE[0]);
  assert.deepEqual(mergeHistory([], {saves:[record],deletes:[]}), [record]);
  assert.deepEqual(mergeHistory([record], {saves:[],deletes:[record.id]}), []);
  assert.deepEqual(mergeHistory([], {saves:[],deletes:[]}), []);
});

test('a budget below all food prices returns no match instead of overspending', () => {
  assert.equal(getRecommendation({category:'food',budget:1,preference:'anything'}),null);
  for (const budget of [NaN, Infinity, -5, 0, 101]) {
    assert.equal(getRecommendation({category:'food',budget,preference:'anything'}),null);
  }
});
test('all selected dietary tags remain mandatory, even when nothing matches', () => {
  savePreferences({dietaryRestrictions:['halal','vegetarian','beef-free','pork-free']});
  for (const category of ['food','drink','dessert'] as const) {
    const result=getRecommendation({category,budget:30,preference:'anything'});
    if(result) for(const tag of getPreferences().dietaryRestrictions) assert.ok(result.item.dietary.includes(tag));
  }
});
test('exhausted candidates never repeat or fall back to a higher price', () => {
  const ids: string[]=[];
  while(true) {
    const result=getRecommendation({category:'drink',budget:5,preference:'anything',excludeItemIds:ids});
    if(!result) break;
    assert.ok(result.item.price <= 5);assert.ok(!ids.includes(result.item.id));
    ids.push(result.item.id);assert.ok(ids.length <= SUNGAI_LONG_FOOD_DATABASE.length);
  }
  assert.ok(ids.length > 0);
  assert.equal(getRecommendation({category:'drink',budget:5,preference:'anything',excludeItemIds:ids}),null);
});
test('disliked items are not recommended', () => {
  savePreferences({dislikedItems:SUNGAI_LONG_FOOD_DATABASE.map(item=>item.id)});
  assert.equal(getRecommendation({category:'food',budget:100,preference:'anything'}),null);
});
test('new history is empty and accounts cannot read each other’s choices', async () => {
  assert.deepEqual(getHistory(),[]);
  setStorageOwner('alice');saveDecision(SUNGAI_LONG_FOOD_DATABASE[0]);savePreferences({defaultBudgetFood:18});
  setStorageOwner('bob');assert.deepEqual(getHistory(),[]);assert.equal(getPreferences().defaultBudgetFood,10);
  setStorageOwner();assert.deepEqual(getHistory(),[]);
  setStorageOwner('alice');assert.equal(getHistory().length,1);assert.equal(getPreferences().defaultBudgetFood,18);
  await clearAllHistory();assert.deepEqual(getHistory(),[]);
});
test('malformed stored data does not crash the application', () => {
  writeStored('history',[{},null,{price:'oops'}]);assert.deepEqual(getHistory(),[]);
  writeStored('preferences',{defaultBudgetFood:-3,dietaryRestrictions:'halal',dislikedItems:null});
  assert.equal(getPreferences().defaultBudgetFood,10);assert.deepEqual(getPreferences().dietaryRestrictions,[]);
  assert.equal(getDaysAgo('invalid'),Infinity);
});
test('a storage write failure uses the latest in-memory value instead of stale disk data', () => {
  setStorageOwner('storage-blocked');
  writeStored('preferences', {defaultBudgetFood:7});
  const originalStorage = globalThis.localStorage;
  Object.defineProperty(globalThis, 'window', {value:new EventTarget(), configurable:true});
  Object.defineProperty(globalThis, 'localStorage', {value:{
    getItem: (key:string) => data.get(key) ?? null,
    setItem: () => {throw new Error('Quota exceeded');},
  }, configurable:true});
  try {savePreferences({defaultBudgetFood:12});assert.equal(getPreferences().defaultBudgetFood,12);}
  finally {Object.defineProperty(globalThis,'localStorage',{value:originalStorage,configurable:true});setStorageOwner();}
});
test('description parsing does not mistake steak for tea or price for rice', () => {
  assert.notEqual(parsePromptLocally('steak under RM12').category,'drink');
  assert.notEqual(parsePromptLocally('price under 10').preference,'rice');
  assert.equal(parsePromptLocally('noodles under RM9.50').budget,9.5);
  assert.equal(parsePromptLocally('coffee under 5').category,'drink');
  assert.notEqual(parsePromptLocally('not spicy noodles').preference,'spicy');
});
