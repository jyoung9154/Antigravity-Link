import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Antigravity Link',
    short_name: 'Antigravity',
    description: 'Autonomous Native Agent Bridge',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f0f13',
    theme_color: '#8b5cf6',
    icons: [
      {
        src: '/favicon.ico',
        sizes: '192x192',
        type: 'image/ico',
      },
    ],
  }
}
