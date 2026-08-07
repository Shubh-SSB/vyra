export default function IconButton({ children, onClick }: { children: React.ReactNode; onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void }) {
    return (
        <button
            onClick={onClick}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
        >
            {children}
        </button>
    );
}