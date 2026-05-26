declare module 'next' {
  import { IncomingMessage, ServerResponse } from 'http'

  export type Metadata = Record<string, any>
  export type ResolvingMetadata = any
  export type ResolvingViewport = any
  export type AppProps = Record<string, any>

  export interface NextApiRequest extends IncomingMessage {
    body?: any
    query?: any
    cookies?: any
    headers?: any
  }

  export interface NextApiResponse<T = any> extends ServerResponse {
    json: (body: T) => void
    status: (code: number) => NextApiResponse<T>
    send: (body: any) => void
    end: (data?: any) => void
    [key: string]: any
  }
}

declare module 'next/types.js' {
  export type ResolvingMetadata = any
  export type ResolvingViewport = any
}

declare module 'next/server' {
  export class NextResponse extends Response {
    static json(data: unknown, init?: ResponseInit): NextResponse
    static redirect(url: string | URL, status?: number): NextResponse
    static rewrite(destination: string | URL): NextResponse
    static next(): NextResponse
    static error(): NextResponse
    cookie(name: string, value: string, options?: Record<string, unknown>): void
    clearCookie(name: string): void
  }

  export class NextRequest extends Request {
    readonly cookies: unknown
    readonly headers: Headers
    readonly ip?: string
    readonly geo?: Record<string, string | undefined>
    readonly nextUrl: URL
    json(): Promise<any>
    text(): Promise<string>
    formData(): Promise<FormData>
  }
}

declare module 'next/server.js' {
  export * from 'next/server'
}

declare module 'next/link' {
  import * as React from 'react'
  const Link: React.ComponentType<any>
  export default Link
}

declare module 'next/navigation' {
  import * as React from 'react'
  export function useRouter(): any
  export function useSearchParams(): any
  export function usePathname(): string | null
  export function useParams(): any
  export function useSelectedLayoutSegment(): any
  export function useSelectedLayoutSegments(): any
  export function notFound(): never
  export function redirect(destination: string | URL, status?: number): void
  export function createSearchParams(init?: Record<string, string | number | boolean | readonly string[]> | Iterable<[string, string]>): URLSearchParams
}

declare module 'next/font/google' {
  import * as React from 'react'
  type FontOptions = {
    subsets?: string[]
    weight?: string | string[]
    display?: string
    variable?: string
    style?: string | string[]
  }
  type FontFamily = {
    className: string
    style: React.CSSProperties
    variable?: string
  }
  export function Inter(options: FontOptions): FontFamily
  export function Roboto(options: FontOptions): FontFamily
  export function Lora(options: FontOptions): FontFamily
  export function Poppins(options: FontOptions): FontFamily
  export function Montserrat(options: FontOptions): FontFamily
  export function Raleway(options: FontOptions): FontFamily
  export function Open_Sans(options: FontOptions): FontFamily
  export function Playfair_Display(options: FontOptions): FontFamily
  const googleFontFactory: (options: FontOptions) => FontFamily
  export default googleFontFactory
}
