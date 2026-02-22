import { useCallback, useEffect, useMemo, useState } from 'react'

type StockGroup = 'index' | 'mag7'

type StockDefinition = {
	id: string
	symbol: string
	label: string
	group: StockGroup
}

type StockQuote = {
	id: string
	symbol: string
	label: string
	group: StockGroup
	name: string
	price: number | null
	open: number | null
	changePercent: number | null
	asOf: string | null
}

type StocksProps = {
	rotationInterval?: number
}

const STOCKS: StockDefinition[] = [
	{ id: 'sp500', symbol: '^spx', label: 'S&P 500', group: 'index' },
	{ id: 'helsinki', symbol: '^hex', label: 'OMX Helsinki', group: 'index' },
	{ id: 'aapl', symbol: 'aapl.us', label: 'AAPL', group: 'mag7' },
	{ id: 'msft', symbol: 'msft.us', label: 'MSFT', group: 'mag7' },
	{ id: 'amzn', symbol: 'amzn.us', label: 'AMZN', group: 'mag7' },
	{ id: 'googl', symbol: 'googl.us', label: 'GOOGL', group: 'mag7' },
	{ id: 'meta', symbol: 'meta.us', label: 'META', group: 'mag7' },
	{ id: 'nvda', symbol: 'nvda.us', label: 'NVDA', group: 'mag7' },
	{ id: 'tsla', symbol: 'tsla.us', label: 'TSLA', group: 'mag7' },
]

const parseNumber = (value: string | undefined) => {
	if (!value || value === 'N/D') {
		return null
	}
	const parsed = Number.parseFloat(value)
	return Number.isFinite(parsed) ? parsed : null
}

const parseStooqQuote = (
	stock: StockDefinition,
	csvContent: string,
): StockQuote | null => {
	const line = csvContent.trim().split('\n')[0]
	if (!line) {
		return null
	}

	const values = line.split(',')
	if (values.length < 9) {
		return null
	}

	const [symbol, date, time, openRaw, , , closeRaw, , nameRaw] = values
	const price = parseNumber(closeRaw)
	const open = parseNumber(openRaw)
	const changePercent =
		open != null && open > 0 && price != null ? ((price - open) / open) * 100 : null
	const asOf =
		date && time && date !== 'N/D' && time !== 'N/D' ? `${date} ${time}` : null

	return {
		id: stock.id,
		symbol: symbol || stock.symbol.toUpperCase(),
		label: stock.label,
		group: stock.group,
		name: nameRaw || stock.label,
		price,
		open,
		changePercent,
		asOf,
	}
}

const formatPrice = (value: number | null) =>
	value == null
		? 'N/A'
		: value.toLocaleString('en-US', {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			})

const formatChange = (value: number | null) => {
	if (value == null) {
		return '--'
	}
	const sign = value > 0 ? '+' : ''
	return `${sign}${value.toFixed(2)}%`
}

const getChangeColor = (value: number | null) => {
	if (value == null) {
		return 'text-stone-500'
	}
	if (value > 0) {
		return 'text-emerald-600'
	}
	if (value < 0) {
		return 'text-red-600'
	}
	return 'text-stone-700'
}

const useAutoRefreshingStocks = (refreshIntervalMS: number = 60 * 1000) => {
	const [quotesById, setQuotesById] = useState<Record<string, StockQuote>>({})
	const [isLoading, setIsLoading] = useState(true)
	const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null)

	const fetchStocks = useCallback(async () => {
		const results = await Promise.allSettled(
			STOCKS.map(async (stock) => {
				const response = await fetch(
					`/stocksproxy/q/l/?s=${encodeURIComponent(stock.symbol)}&f=sd2t2ohlcvn&e=csv`,
				)

				if (!response.ok) {
					throw new Error(
						`Failed to fetch ${stock.symbol} with status ${response.status}`,
					)
				}

				const csvContent = await response.text()
				const quote = parseStooqQuote(stock, csvContent)
				if (!quote) {
					throw new Error(`Failed to parse response for ${stock.symbol}`)
				}
				return quote
			}),
		)

		const nextQuotes: Record<string, StockQuote> = {}
		for (const result of results) {
			if (result.status === 'fulfilled') {
				nextQuotes[result.value.id] = result.value
			}
		}

		if (Object.keys(nextQuotes).length > 0) {
			setQuotesById((previous) => ({ ...previous, ...nextQuotes }))
			setLastUpdatedAt(new Date())
		}
		setIsLoading(false)
	}, [])

	useEffect(() => {
		void fetchStocks()
		const interval = setInterval(() => {
			void fetchStocks()
		}, refreshIntervalMS)

		return () => clearInterval(interval)
	}, [fetchStocks, refreshIntervalMS])

	return { quotesById, isLoading, lastUpdatedAt }
}

const Stocks = (_props: StocksProps) => {
	const { quotesById } = useAutoRefreshingStocks()

	const indexStocks = useMemo(
		() => STOCKS.filter((stock) => stock.group === 'index'),
		[],
	)
	const mag7Stocks = useMemo(
		() => STOCKS.filter((stock) => stock.group === 'mag7'),
		[],
	)

	return (
		<div className="h-full flex flex-col gap-4">
			<div className="flex items-start justify-between">
				<div>
					<h1 className="text-4xl font-bold">Market Snapshot</h1>
					<p className="text-stone-500 text-lg">
						S&P 500, OMX Helsinki, ja S&P 7
					</p>
				</div>

			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				{indexStocks.map((stock) => {
					const quote = quotesById[stock.id]
					return (
						<div
							key={stock.id}
							className="bg-white rounded-lg shadow-md p-4 flex flex-col gap-2"
						>
							<p className="text-xl text-stone-600">{stock.label}</p>
							<p className="text-4xl font-mono font-bold">
								{formatPrice(quote?.price ?? null)}
							</p>
							<p
								className={`text-xl font-semibold ${getChangeColor(
									quote?.changePercent ?? null,
								)}`}
							>
								{formatChange(quote?.changePercent ?? null)}
							</p>
						</div>
					)
				})}
			</div>

			<div className="bg-white rounded-lg shadow-md p-4 flex-1">
				<h2 className="text-3xl font-bold mb-3">Magnificent Seven</h2>
				<div className="grid grid-cols-[1fr_1.4fr_1fr_1fr] gap-x-3 gap-y-2 items-center">
					<p className="text-sm font-semibold text-stone-500">$</p>
					<p className="text-sm font-semibold text-stone-500">Nimi</p>
					<p className="text-sm font-semibold text-stone-500 text-right">Hinta</p>
					<p className="text-sm font-semibold text-stone-500 text-right">Muutos</p>
					{mag7Stocks.map((stock) => {
						const quote = quotesById[stock.id]
						return (
							<div
								key={stock.id}
								className="contents [&>*]:py-1 [&>*]:border-t [&>*]:border-stone-100"
							>
								<p className="font-mono font-semibold">{stock.label}</p>
								<p className="truncate text-stone-700">
									{quote?.name || stock.label}
								</p>
								<p className="text-right font-mono">
									{formatPrice(quote?.price ?? null)}
								</p>
								<p
									className={`text-right font-mono font-semibold ${getChangeColor(
										quote?.changePercent ?? null,
									)}`}
								>
									{formatChange(quote?.changePercent ?? null)}
								</p>
							</div>
						)
					})}
				</div>
			</div>
		</div>
	)
}

Stocks.displayName = 'Stocks'

export default Stocks
