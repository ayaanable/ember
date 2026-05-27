import React, { useEffect, useState } from 'react';
import { Minimize2, Maximize2, PanelTopClose, X } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';

type ResizeDirection = 'East' | 'North' | 'NorthEast' | 'NorthWest' | 'South' | 'SouthEast' | 'SouthWest' | 'West';

function ResizeHandle({
  direction,
  className,
}: {
  direction: ResizeDirection;
  className: string;
}) {
  const handlePointerDown = async (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();

    try {
      await getCurrentWindow().startResizeDragging(direction);
    } catch {
      // Some compositors ignore resize drag requests from the webview.
    }
  };

  return <div className={className} onPointerDown={handlePointerDown} />;
}

export default function Titlebar() {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    let isDisposed = false;
    let unlistenResize: (() => void) | undefined;

    try {
      const appWindow = getCurrentWindow();

      void appWindow.isMaximized()
        .then((value) => {
          if (!isDisposed) {
            setIsMaximized(value);
          }
        })
        .catch(() => undefined);

      void appWindow.onResized(async () => {
        try {
          const maximized = await appWindow.isMaximized();
          if (!isDisposed) {
            setIsMaximized(maximized);
          }
        } catch {
          // Ignore platforms that do not report maximize state reliably.
        }
      }).then((unlisten) => {
        unlistenResize = unlisten;
      });
    } catch {
      // If the Tauri runtime is unavailable, keep the titlebar visible and inert.
    }

    return () => {
      isDisposed = true;
      unlistenResize?.();
    };
  }, []);

  const handleMinimize = async () => {
    await getCurrentWindow().minimize().catch(() => undefined);
  };

  const handleMaximize = async () => {
    const appWindow = getCurrentWindow();

    try {
      if (await appWindow.isMaximized()) {
        await appWindow.unmaximize();
        setIsMaximized(false);
      } else {
        await appWindow.maximize();
        setIsMaximized(true);
      }
    } catch {
      await appWindow.toggleMaximize().catch(() => undefined);
    }
  };

  const handleClose = async () => {
    await getCurrentWindow().close().catch(() => undefined);
  };

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-60">
        <ResizeHandle
          direction="North"
          className="pointer-events-auto absolute left-0 right-0 top-0 h-1.5 cursor-ns-resize"
        />
        <ResizeHandle
          direction="West"
          className="pointer-events-auto absolute bottom-0 left-0 top-0 w-1.5 cursor-ew-resize"
        />
        <ResizeHandle
          direction="East"
          className="pointer-events-auto absolute bottom-0 right-0 top-0 w-1.5 cursor-ew-resize"
        />
        <ResizeHandle
          direction="South"
          className="pointer-events-auto absolute bottom-0 left-0 right-0 h-1.5 cursor-ns-resize"
        />
        <ResizeHandle
          direction="NorthWest"
          className="pointer-events-auto absolute left-0 top-0 h-3 w-3 cursor-nwse-resize"
        />
        <ResizeHandle
          direction="NorthEast"
          className="pointer-events-auto absolute right-0 top-0 h-3 w-3 cursor-nesw-resize"
        />
        <ResizeHandle
          direction="SouthWest"
          className="pointer-events-auto absolute bottom-0 left-0 h-3 w-3 cursor-nesw-resize"
        />
        <ResizeHandle
          direction="SouthEast"
          className="pointer-events-auto absolute bottom-0 right-0 h-3 w-3 cursor-nwse-resize"
        />
      </div>

      <header className="fixed inset-x-0 top-0 z-50 flex h-10 items-center border-b border-white/6 bg-[#171515]/96 text-on-surface-variant shadow-[0_1px_0_rgba(255,255,255,0.02)] backdrop-blur-xl">
      <div className="flex h-full flex-1 items-center gap-3 px-4 select-none" data-tauri-drag-region>
        <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-on-surface-variant/75">
          Ember
        </span>
      </div>

      <div className="flex h-full items-center gap-1 px-2">
        <button
          type="button"
          onClick={handleMinimize}
          aria-label="Minimize window"
          className="flex h-7 w-7 items-center justify-center rounded-md text-on-surface-variant/80 transition-colors hover:bg-white/5 hover:text-on-surface focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/30"
        >
          <Minimize2 className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={handleMaximize}
          aria-label={isMaximized ? 'Restore window' : 'Maximize window'}
          className="flex h-7 w-7 items-center justify-center rounded-md text-on-surface-variant/80 transition-colors hover:bg-white/5 hover:text-on-surface focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/30"
        >
          {isMaximized ? <PanelTopClose className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
        </button>

        <button
          type="button"
          onClick={handleClose}
          aria-label="Close window"
          className="flex h-7 w-7 items-center justify-center rounded-md text-on-surface-variant/80 transition-colors hover:bg-[#ff6b6b]/10 hover:text-[#ffb4ab] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#ff6b6b]/30"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      </header>
    </>
  );
}