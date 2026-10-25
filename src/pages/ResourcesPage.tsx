import { ResourcesLibrary } from '../components/sections/ResourcesLibrary'
import { LearningLibrary } from '../components/sections/LearningLibrary'

export function ResourcesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <ResourcesLibrary />
      <LearningLibrary />
    </div>
  )
}
