export default function Main() {
    return ( 
        <main>
            <div>
                <button>Get links in page</button>
                <button>Add current link</button>
                <button onClick={e => open_sidebar(e)}>Open Sidebar</button>
            </div>
        </main>
    )
}

function open_sidebar(e: React.MouseEvent) {
    
}