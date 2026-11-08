import React from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
export default function MapProvider({ apiKey, children }: { apiKey: string; children: React.ReactNode }) {
  return <APIProvider apiKey={apiKey} libraries={['places','marker']}>{children}</APIProvider>;
}
