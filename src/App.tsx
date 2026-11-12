import { lazy, Suspense } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { LanguageProvider, useLanguage } from './lib/LanguageProvider.tsx'

const UploadPage = lazy(() => import('./pages/UploadPage.tsx').then((module) => ({ default: module.UploadPage })))
const MobilePage = lazy(() => import('./pages/MobilePage.tsx').then((module) => ({ default: module.MobilePage })))

export default function App() {
  return (
    <LanguageProvider>
      <HashRouter>
        <Suspense fallback={<LoadingLine />}>
          <Routes>
            <Route path="/" element={<UploadPage />} />
            <Route path="/m/:payload" element={<MobilePage />} />
          </Routes>
        </Suspense>
      </HashRouter>
    </LanguageProvider>
  )
}

function LoadingLine() {
  const { t } = useLanguage()
  return <p className="px-5 py-10 text-base">{t.loading}</p>
}
