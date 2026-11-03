import { HashRouter, Route, Routes } from 'react-router-dom'
import { StoreProvider } from './lib/store'
import { Layout } from './components/Layout'
import { BrowsePage } from './pages/BrowsePage'
import { HomePage } from './pages/HomePage'
import { HowItWorksPage } from './pages/HowItWorksPage'
import { ListingDetailPage } from './pages/ListingDetailPage'
import { MyListingsPage } from './pages/MyListingsPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PostPage } from './pages/PostPage'
import { SavedPage } from './pages/SavedPage'

export default function App() {
  return (
    <HashRouter>
      <StoreProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="browse" element={<BrowsePage />} />
            <Route path="listing/:id" element={<ListingDetailPage />} />
            <Route path="post" element={<PostPage />} />
            <Route path="saved" element={<SavedPage />} />
            <Route path="my-listings" element={<MyListingsPage />} />
            <Route path="how-it-works" element={<HowItWorksPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </StoreProvider>
    </HashRouter>
  )
}
