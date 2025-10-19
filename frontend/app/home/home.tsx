export function meta() {
    return [
        { title: 'Chat' },
        { name: 'description', content: 'A simple chat app based React and FastAPI' },
    ]
}

export default function Home() {
    return (
        <div className="flex flex-1 h-full items-center justify-center bg-message-list">
            <b>
                Select a chat or create a new one
            </b>
        </div>
    )
}
