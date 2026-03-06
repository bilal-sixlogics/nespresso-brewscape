<x-filament-panels::page>
    {{ $this->table }}

    {{-- Transaction History Slide-over --}}
    @if ($transactionHistory !== null)
        <div
            x-data="{ open: true }"
            x-show="open"
            class="fixed inset-0 z-50 flex items-start justify-end"
            style="background: rgba(0,0,0,0.4);"
        >
            <div
                class="relative h-full w-full max-w-xl bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto"
                x-show="open"
                x-transition:enter="transition ease-out duration-300"
                x-transition:enter-start="translate-x-full"
                x-transition:enter-end="translate-x-0"
                x-transition:leave="transition ease-in duration-200"
                x-transition:leave-start="translate-x-0"
                x-transition:leave-end="translate-x-full"
            >
                <div class="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                    <div>
                        <h2 class="text-lg font-bold text-gray-900 dark:text-white">Stock History</h2>
                        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{{ $selectedUnitLabel }}</p>
                    </div>
                    <button
                        wire:click="closeHistory"
                        class="rounded-full p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <x-heroicon-o-x-mark class="w-5 h-5" />
                    </button>
                </div>

                <div class="px-6 py-4 space-y-3">
                    @forelse ($transactionHistory as $tx)
                        <div class="flex items-start gap-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3">
                            <div class="mt-0.5">
                                @php
                                    $icon = match($tx['type']) {
                                        'restock' => 'heroicon-o-arrow-up-circle',
                                        'return'  => 'heroicon-o-arrow-uturn-left',
                                        'sale'    => 'heroicon-o-shopping-cart',
                                        'wastage' => 'heroicon-o-trash',
                                        default   => 'heroicon-o-arrows-up-down',
                                    };
                                    $color = match($tx['type']) {
                                        'restock', 'return' => 'text-green-500',
                                        'sale'              => 'text-blue-500',
                                        'wastage'           => 'text-red-500',
                                        default             => 'text-amber-500',
                                    };
                                @endphp
                                <x-dynamic-component :component="$icon" class="w-5 h-5 {{ $color }}" />
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center justify-between gap-2">
                                    <span class="text-sm font-semibold text-gray-800 dark:text-gray-100 capitalize">
                                        {{ $tx['type'] }}
                                    </span>
                                    <span class="text-xs text-gray-400">{{ $tx['date'] }}</span>
                                </div>
                                <div class="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                    <span>{{ number_format($tx['before'], 0) }}</span>
                                    <x-heroicon-o-arrow-right class="w-3.5 h-3.5" />
                                    <span class="font-medium text-gray-700 dark:text-gray-200">{{ number_format($tx['after'], 0) }}</span>
                                    <span class="text-xs rounded-full px-1.5 py-0.5 font-mono
                                        @if($tx['after'] > $tx['before']) bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400
                                        @elseif($tx['after'] < $tx['before']) bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400
                                        @else bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300
                                        @endif">
                                        @if($tx['after'] > $tx['before'])
                                            +{{ number_format($tx['after'] - $tx['before'], 0) }}
                                        @elseif($tx['after'] < $tx['before'])
                                            {{ number_format($tx['after'] - $tx['before'], 0) }}
                                        @else
                                            ±0
                                        @endif
                                    </span>
                                </div>
                                @if($tx['notes'])
                                    <p class="mt-1 text-xs text-gray-400 italic truncate">{{ $tx['notes'] }}</p>
                                @endif
                            </div>
                        </div>
                    @empty
                        <div class="text-center py-12 text-gray-400">
                            <x-heroicon-o-inbox class="w-12 h-12 mx-auto mb-3 opacity-40" />
                            <p class="text-sm">No transaction history yet</p>
                        </div>
                    @endforelse
                </div>
            </div>
        </div>
    @endif
</x-filament-panels::page>
