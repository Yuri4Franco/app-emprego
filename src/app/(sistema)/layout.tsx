import { Sidebar } from "@/src/components/Sidebar";


export default function EmpresaLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-50/50">
            <Sidebar/>

            <main className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}