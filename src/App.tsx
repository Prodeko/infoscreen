const App = () => {
	return (
		<div className="grid min-h-screen grid-cols-[2fr_2fr_1fr] grid-rows-[100px_auto_100px] gap-10 bg-gray-50 p-4">
			<h1 className="text-xl font-bold underline bg-blue-100 col-span-2">
				Prodeko
			</h1>
			<h1 className="text-xl font-bold underline bg-green-200">Time</h1>
			<h1 className="text-xl font-bold underline bg-orange-100">Kanttiinit</h1>
			<h1 className="text-xl font-bold underline bg-orange-100 row-span-2">
				Ilmos
			</h1>
			<h1 className="text-xl font-bold underline bg-orange-100 row-span-2">
				Viewers
			</h1>
			<h1 className="text-xl font-bold underline bg-orange-100">Sponsors</h1>
		</div>
	)
}

export default App
