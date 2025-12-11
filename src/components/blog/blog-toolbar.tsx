"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, ListFilter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface BlogToolbarProps {
  categories: { id: string; name: string; slug: string }[]
}

export function BlogToolbar({ categories }: BlogToolbarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSearch = searchParams.get("search") || ""
  const currentCategory = searchParams.get("category") || null

  const [search, setSearch] = useState(currentSearch)
  const [open, setOpen] = useState(false)

  // Sync state with URL if it changes externally
  useEffect(() => {
    setSearch(currentSearch)
  }, [currentSearch])

  // Debounce search update
  useEffect(() => {
    const timer = setTimeout(() => {
      // Avoid pushing if the value hasn't changed relative to the URL
      if (search === currentSearch) return

      const params = new URLSearchParams(searchParams.toString())
      if (search) {
        params.set("search", search)
      } else {
        params.delete("search")
      }
      // Reset page when searching
      params.delete("page")

      router.push(`/blog?${params.toString()}`)
    }, 300)

    return () => clearTimeout(timer)
  }, [search, router, searchParams, currentSearch])

  const handleCategorySelect = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (currentCategory === slug) {
      params.delete("category")
    } else {
      params.set("category", slug)
    }
    params.delete("page") // Reset page
    router.push(`/blog?${params.toString()}`)
    setOpen(false)
  }

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("category")
    params.delete("search")
    params.delete("page")
    router.push(`/blog?${params.toString()}`)
    setSearch("")
    setOpen(false)
  }

  const activeFiltersCount = (currentCategory ? 1 : 0)

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search posts..."
          className="pl-8 w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              <ListFilter className="h-4 w-4" />
              Filter
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[240px] p-0" align="end">
            <div className="p-4 border-b">
              <h4 className="font-medium leading-none">Filter by Category</h4>
            </div>
            <div className="p-2 grid gap-1">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={currentCategory === category.slug ? "secondary" : "ghost"}
                  className="justify-start font-normal"
                  onClick={() => handleCategorySelect(category.slug)}
                >
                  {category.name}
                  {currentCategory === category.slug && (
                    <span className="ml-auto flex h-2 w-2 rounded-full bg-primary" />
                  )}
                </Button>
              ))}
              {categories.length === 0 && (
                <p className="text-sm text-muted-foreground p-2">No categories found.</p>
              )}
            </div>
            {(currentCategory) && (
              <div className="p-2 border-t mt-2">
                <Button
                  variant="ghost"
                  className="w-full justify-center text-muted-foreground hover:text-foreground"
                  onClick={clearFilters}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
