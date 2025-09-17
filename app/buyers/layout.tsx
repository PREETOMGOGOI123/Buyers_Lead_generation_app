import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function BuyersLayout({ children }: { children: React.ReactNode }){
    const user = await getCurrentUser()

    return (
        <div className="min-h-screen base-200">
            <main className="container mx-auto px-4 py-6">
                {children}
            </main>
        </div>
    )
}