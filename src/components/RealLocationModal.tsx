import React, { useEffect, useId, useRef, useState } from 'react';
import { Map, AdvancedMarker, useMapsLibrary } from '@vis.gl/react-google-maps';
import { FoodItem } from '../types/food';
import { getVerifiedPlaceInfo, VerifiedPlaceInfo } from '../services/googleMapsPlaceService';
export function RealLocationModal({ isOpen, onClose, item }: {isOpen:boolean;onClose:()=>void;item:FoodItem;}) {
  const dialog=useRef<HTMLDialogElement>(null);const id=useId();
  const library=useMapsLibrary('places');
  const [place,setPlace]=useState<VerifiedPlaceInfo|null>(null);
  const [failed,setFailed]=useState(false);
  useEffect(()=>{
    if(!isOpen)return;
    const previous=document.activeElement as HTMLElement|null;
    dialog.current?.showModal();
    return ()=>{dialog.current?.close();previous?.focus();};
  },[isOpen]);
  useEffect(()=>{
    let active=true;setPlace(null);setFailed(false);
    void getVerifiedPlaceInfo(item,library).then(info=>{if(active)setPlace(info);}).catch(()=>{if(active)setFailed(true);});
    return ()=>{active=false;};
  },[item,library]);
  return <dialog ref={dialog} className="confirm-dialog map-dialog" aria-labelledby={id} onCancel={e=>{e.preventDefault();onClose();}}>
    <div className="row-between"><h2 id={id}>Location preview</h2><button className="text-button" onClick={onClose} autoFocus>Close</button></div>
    <p>{item.locationName}</p><p className="notice">This pin is an approximate area or a possible search match. Check the shop and route on Google Maps before going.</p>
    {place ? <><div className="map-canvas"><Map mapId="DEMO_MAP_ID" defaultCenter={place.location} defaultZoom={16} gestureHandling="cooperative" clickableIcons={false} style={{width:'100%',height:'100%'}}>
      <AdvancedMarker position={place.location} title="Approximate location" />
    </Map></div><p className="small muted">{place.formattedAddress}</p><a className="text-button" href={place.googleMapsURI} target="_blank" rel="noopener noreferrer">Open Google Maps ↗</a></> : <p role="status">{failed ? 'The preview could not load. Use the Google Maps search link on your suggestion.' : 'Loading the area…'}</p>}
  </dialog>;
}
