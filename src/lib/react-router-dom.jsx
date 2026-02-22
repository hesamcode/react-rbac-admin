/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

const RouterContext = createContext(null)

const normalizePath = (to) => {
  if (typeof to !== 'string' || to.trim().length === 0) {
    return '/'
  }

  const [pathnamePart, searchPart = ''] = to.trim().split('?')
  const pathname = pathnamePart.startsWith('/') ? pathnamePart : `/${pathnamePart}`
  const normalizedPathname = pathname.replace(/\/{2,}/g, '/').replace(/(.)\/$/, '$1') || '/'
  return searchPart ? `${normalizedPathname}?${searchPart}` : normalizedPathname
}

const parseHashLocation = () => {
  if (typeof window === 'undefined') {
    return {
      pathname: '/',
      search: '',
      hash: '#/',
    }
  }

  const hashValue = window.location.hash.slice(1)
  const normalized = normalizePath(hashValue || '/')
  const [pathname, search = ''] = normalized.split('?')

  return {
    pathname: pathname || '/',
    search: search ? `?${search}` : '',
    hash: `#${normalized}`,
  }
}

const getHref = (to) => `#${normalizePath(to)}`

const isModifiedEvent = (event) =>
  event.metaKey || event.altKey || event.ctrlKey || event.shiftKey

export function HashRouter({ children }) {
  const [location, setLocation] = useState(parseHashLocation)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    if (!window.location.hash) {
      const baseUrl = `${window.location.pathname}${window.location.search}`
      window.history.replaceState(null, '', `${baseUrl}#/`)
    }

    const handleHashChange = () => {
      setLocation(parseHashLocation())
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const navigate = useCallback((to, options = {}) => {
    if (typeof window === 'undefined') {
      return
    }

    const nextPath = normalizePath(to)

    if (options.replace) {
      const baseUrl = `${window.location.pathname}${window.location.search}`
      window.history.replaceState(null, '', `${baseUrl}#${nextPath}`)
      setLocation(parseHashLocation())
      return
    }

    if (window.location.hash === `#${nextPath}`) {
      setLocation(parseHashLocation())
      return
    }

    window.location.hash = nextPath
  }, [])

  const contextValue = useMemo(
    () => ({
      location,
      navigate,
      createHref: getHref,
    }),
    [location, navigate],
  )

  return <RouterContext.Provider value={contextValue}>{children}</RouterContext.Provider>
}

export const Link = forwardRef(function Link(
  { to, replace = false, onClick, target, children, ...rest },
  ref,
) {
  const { navigate, createHref } = useRouterContext()

  const handleClick = (event) => {
    onClick?.(event)

    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      isModifiedEvent(event) ||
      target === '_blank'
    ) {
      return
    }

    event.preventDefault()
    navigate(to, { replace })
  }

  return (
    <a {...rest} href={createHref(to)} onClick={handleClick} ref={ref} target={target}>
      {children}
    </a>
  )
})

export const NavLink = forwardRef(function NavLink(
  { to, end = false, className, children, ...rest },
  ref,
) {
  const { location } = useRouterContext()
  const targetPath = normalizePath(to).split('?')[0]
  const currentPath = location.pathname

  const isActive =
    targetPath === '/'
      ? currentPath === '/'
      : end
        ? currentPath === targetPath
        : currentPath === targetPath || currentPath.startsWith(`${targetPath}/`)

  const resolvedClassName =
    typeof className === 'function' ? className({ isActive }) : className

  return (
    <Link {...rest} aria-current={isActive ? 'page' : undefined} className={resolvedClassName} ref={ref} to={to}>
      {typeof children === 'function' ? children({ isActive }) : children}
    </Link>
  )
})

export function useLocation() {
  const { location } = useRouterContext()
  return location
}

export function useNavigate() {
  const { navigate } = useRouterContext()
  return navigate
}

function useRouterContext() {
  const context = useContext(RouterContext)

  if (!context) {
    throw new Error('Routing hooks/components must be used inside HashRouter.')
  }

  return context
}
