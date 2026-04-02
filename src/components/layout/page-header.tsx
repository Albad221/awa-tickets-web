import Link from "next/link";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  breadcrumbs?: Breadcrumb[];
  children?: React.ReactNode;
}

export function PageHeader({ title, breadcrumbs, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mb-1 flex items-center gap-1 text-sm text-muted-foreground">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span>/</span>}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-foreground">
                    {crumb.label}
                  </Link>
                ) : (
                  <span>{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
