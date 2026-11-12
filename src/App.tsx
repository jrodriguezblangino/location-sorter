import { lazy, Suspense } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'

const UploadPage = lazy(() => import('./pages/UploadPage.tsx').then((module) => ({ default: module.UploadPage })))
const MobilePage = lazy(() => import('./pages/MobilePage.tsx').then((module) => ({ default: module.MobilePage })))

export default function App() {
  return (
    <HashRouter>
      <Suspense fallback={<p className="px-5 py-10 text-base">Indlæser…</p>}>
        <Routes>
          <Route path="/" element={<UploadPage />} />
          <Route path="/m/:payload" element={<MobilePage />} />
        </Routes>
      </Suspense>
    </HashRouter>
  )
}
