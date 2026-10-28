import { useCallback, useEffect, useMemo, useState } from 'react'

type StockGroup = 'index' | 'mag7'

type StockDefinition = {
	id: string
	symbol: string
	label: string
	name: string
	group: StockGroup
}

export type StockQuote = {
	id: string
	symbol: string
	label: string
	group: StockGroup
	name: string
	price: number | null
	previousClose: number | null
	changePercent: number | null
	asOf: string | null
}

type StocksProps = {
	quotesById: Record<string, StockQuote>
	rotationInterval?: number
}

const STOCKS: StockDefinition[] = [
	{
		id: 'sp500',
		symbol: '^GSPC',
		label: 'S&P 500',
		name: 'S&P 500',
		group: 'index',
	},
	{
		id: 'helsinki',
		symbol: '^OMXHPI',
		label: 'OMX Helsinki',
		name: 'OMX Helsinki',
		group: 'index',
	},
	{ id: 'aapl', symbol: 'AAPL', label: 'AAPL', name: 'Apple', group: 'mag7' },
	{
		id: 'msft',
		symbol: 'MSFT',
		label: 'MSFT',
		name: 'Microsoft',
		group: 'mag7',
	},
	{ id: 'amzn', symbol: 'AMZN', label: 'AMZN', name: 'Amazon', group: 'mag7' },
	{
		id: 'googl',
		symbol: 'GOOGL',
		label: 'GOOGL',
		name: 'Alphabet',
		group: 'mag7',
	},
	{
		id: 'meta',
		symbol: 'META',
		label: 'META',
		name: 'Meta Platforms',
		group: 'mag7',
	},
	{ id: 'nvda', symbol: 'NVDA', label: 'NVDA', name: 'NVIDIA', group: 'mag7' },
	{ id: 'tsla', symbol: 'TSLA', label: 'TSLA', name: 'Tesla', group: 'mag7' },
]

// Yahoo's spark API (unofficial, no key needed) returns every symbol in one
// request; one request per symbol gets rate limited.
// query1.finance.yahoo.com/v8/finance/spark?symbols=AAPL,MSFT&range=1d&interval=1d
type YahooSparkResponse = Record<
	string,
	{
		chartPreviousClose?: number | null
		close?: (number | null)[] | null
		timestamp?: number[] | null
	} | null
>

const last = <T,>(values: T[] | null | undefined) =>
	values ? values[values.length - 1] : undefined

const parseSparkQuote = (
	stock: StockDefinition,
	response: YahooSparkResponse,
): StockQuote | null => {
	const spark = response[stock.symbol]
	const price = last(spark?.close)
	if (price == null) {
		return null
	}

	const previousClose = spark?.chartPreviousClose ?? null
	const changePercent =
		previousClose != null && previousClose > 0
			? ((price - previousClose) / previousClose) * 100
			: null
	const time = last(spark?.timestamp)

	return {
		id: stock.id,
		symbol: stock.symbol,
		label: stock.label,
		group: stock.group,
		name: stock.name,
		price,
		previousClose,
		changePercent,
		asOf: time ? new Date(time * 1000).toISOString() : null,
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

export const useAutoRefreshingStocks = (
	refreshIntervalMS: number = 5 * 60 * 1000,
) => {
	const [quotesById, setQuotesById] = useState<Record<string, StockQuote>>({})
	const [isLoading, setIsLoading] = useState(true)
	const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null)

	const fetchStocks = useCallback(async () => {
		try {
			const symbols = STOCKS.map((stock) => stock.symbol).join(',')
			const response = await fetch(
				`/stocksproxy/v8/finance/spark?symbols=${encodeURIComponent(symbols)}&range=1d&interval=1d`,
			)
			if (!response.ok) {
				throw new Error(`Stocks request failed with status ${response.status}`)
			}

			const data = (await response.json()) as YahooSparkResponse
			const nextQuotes: Record<string, StockQuote> = {}
			for (const stock of STOCKS) {
				const quote = parseSparkQuote(stock, data)
				if (quote) {
					nextQuotes[quote.id] = quote
				}
			}

			if (Object.keys(nextQuotes).length > 0) {
				setQuotesById((previous) => ({ ...previous, ...nextQuotes }))
				setLastUpdatedAt(new Date())
			}
		} catch (error) {
			console.error('Failed to fetch stocks. Maybe Yahoo is down?', error)
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

const Stocks = ({ quotesById }: StocksProps) => {
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
					<p className="text-sm font-semibold text-stone-500 text-right">
						Hinta
					</p>
					<p className="text-sm font-semibold text-stone-500 text-right">
						Muutos
					</p>
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
