import NotebookEditor from '@/components/notebook/NotebookEditor';

export default function NotebookPage() {
    return (
        <div className="min-h-screen p-8 bg-grid-slate-900/[0.04] dark:bg-grid-slate-400/[0.05]">
            <header className="mb-8 text-center">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500">
                    Interactive Notebooks
                </h1>
                <p className="text-gray-400 mt-2">Run Python & SQL kernels directly in the browser.</p>
            </header>

            <NotebookEditor />
        </div>
    );
}
