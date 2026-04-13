import SidebarEmpresa from "@/src/components/empresa/SidebarEmpresa";


export default function EmpresaLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-gray-50/50">
            {/* Sidebar fixa na esquerda */}
            <SidebarEmpresa />

            {/* Conteúdo da página na direita */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}