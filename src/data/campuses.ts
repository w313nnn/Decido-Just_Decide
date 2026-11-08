import { Campus } from '../types/food';

export const CAMPUSES: Campus[] = [
  {
    id: 'utar-sungai-long',
    name: 'UTAR Sungai Long Campus',
    shortCode: 'UTAR SL',
    universityName: 'Universiti Tunku Abdul Rahman',
    town: 'Bandar Sungai Long, Kajang',
    state: 'Selangor',
    isAvailable: true,
    landmark: 'KB Block & Jalan SL 1/3 commercial square',
  },
  {
    id: 'utar-kampar',
    name: 'UTAR Kampar Campus',
    shortCode: 'UTAR KPR',
    universityName: 'Universiti Tunku Abdul Rahman',
    town: 'Bandar Barat, Kampar',
    state: 'Perak',
    isAvailable: false,
    landmark: 'Grand Kampar & Westlake area (Phase 3)',
  },
  {
    id: 'um-kuala-lumpur',
    name: 'Universiti Malaya (UM)',
    shortCode: 'UM',
    universityName: 'Universiti Malaya',
    town: 'Lembah Pantai, Kuala Lumpur',
    state: 'Kuala Lumpur',
    isAvailable: false,
    landmark: 'Pantai Dalam & Bangsar South (Phase 3)',
  },
  {
    id: 'ukm-bangi',
    name: 'UKM Bangi',
    shortCode: 'UKM',
    universityName: 'Universiti Kebangsaan Malaysia',
    town: 'Bangi',
    state: 'Selangor',
    isAvailable: false,
    landmark: 'Bandar Baru Bangi (Phase 3)',
  },
];

export const DEFAULT_CAMPUS_ID = 'utar-sungai-long';

