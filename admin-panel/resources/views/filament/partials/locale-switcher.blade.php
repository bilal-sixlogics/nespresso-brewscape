{{--
    Locale Switcher — scalable Alpine.js dropdown.
    Reads from config('cafrezzo.locales') — add any number of languages there;
    this component will render them all in a scrollable dropdown without breaking the topbar.
--}}
@php
    $locales  = config('cafrezzo.locales', ['fr' => ['flag' => '🇫🇷', 'label' => 'Français']]);
    $current  = app()->getLocale();
    $active   = $locales[$current] ?? ['flag' => '🌐', 'label' => strtoupper($current)];
@endphp

<div
    x-data="{ open: false }"
    @click.outside="open = false"
    @keydown.escape.window="open = false"
    class="relative flex items-center mr-2"
>
    {{-- Trigger button --}}
    <button
        type="button"
        @click="open = !open"
        :aria-expanded="open"
        aria-haspopup="listbox"
        class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
               text-sm font-medium select-none
               text-gray-600 dark:text-gray-400
               hover:bg-gray-100 dark:hover:bg-white/[0.06]
               border border-transparent
               hover:border-gray-200 dark:hover:border-white/10
               transition-all duration-150 ease-out
               focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
    >
        <span class="text-base leading-none" aria-hidden="true">{{ $active['flag'] }}</span>
        <span class="text-xs font-bold uppercase tracking-widest opacity-60">{{ $current }}</span>
        <svg
            class="w-3 h-3 opacity-40 transition-transform duration-200"
            :class="open ? 'rotate-180' : ''"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/>
        </svg>
    </button>

    {{-- Dropdown panel --}}
    <div
        x-show="open"
        x-transition:enter="transition ease-out duration-150"
        x-transition:enter-start="opacity-0 scale-95 -translate-y-1"
        x-transition:enter-end="opacity-100 scale-100 translate-y-0"
        x-transition:leave="transition ease-in duration-100"
        x-transition:leave-start="opacity-100 scale-100 translate-y-0"
        x-transition:leave-end="opacity-0 scale-95 -translate-y-1"
        role="listbox"
        class="absolute right-0 top-full mt-2 min-w-[10rem] max-h-72 overflow-y-auto
               rounded-xl border border-gray-200 dark:border-white/10
               bg-white dark:bg-zinc-900
               shadow-2xl shadow-black/10 dark:shadow-black/40
               ring-1 ring-black/5 dark:ring-white/5
               z-50 py-1 origin-top-right"
        style="display: none"
    >
        @foreach ($locales as $code => $locale)
            <a
                href="?lang={{ $code }}"
                role="option"
                aria-selected="{{ $current === $code ? 'true' : 'false' }}"
                class="flex items-center gap-2.5 px-3 py-2 text-sm transition-colors duration-100 group
                       {{ $current === $code
                           ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400 font-semibold'
                           : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.05] font-medium' }}"
            >
                <span class="text-base leading-none" aria-hidden="true">{{ $locale['flag'] }}</span>
                <span class="flex-1">{{ $locale['label'] }}</span>
                @if ($current === $code)
                    <svg class="w-3.5 h-3.5 text-primary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                    </svg>
                @endif
            </a>
        @endforeach
    </div>
</div>
