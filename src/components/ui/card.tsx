import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Root Card component.
 *
 * @param {object} props - The component props.
 * @param {string} props.className - Additional class names.
 * @returns {JSX.Element} The rendered Card.
 */
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

/**
 * Header section of the Card.
 *
 * @param {object} props - The component props.
 * @param {string} props.className - Additional class names.
 * @returns {JSX.Element} The rendered Card Header.
 */
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-1.5 px-6", className)}
      {...props}
    />
  )
}

/**
 * Title of the Card.
 *
 * @param {object} props - The component props.
 * @param {string} props.className - Additional class names.
 * @returns {JSX.Element} The rendered Card Title.
 */
function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold tracking-tight", className)}
      {...props}
    />
  )
}

/**
 * Description text for the Card.
 *
 * @param {object} props - The component props.
 * @param {string} props.className - Additional class names.
 * @returns {JSX.Element} The rendered Card Description.
 */
function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

/**
 * Main content area of the Card.
 *
 * @param {object} props - The component props.
 * @param {string} props.className - Additional class names.
 * @returns {JSX.Element} The rendered Card Content.
 */
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

/**
 * Footer section of the Card.
 *
 * @param {object} props - The component props.
 * @param {string} props.className - Additional class names.
 * @returns {JSX.Element} The rendered Card Footer.
 */
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6", className)}
      {...props}
    />
  )
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
