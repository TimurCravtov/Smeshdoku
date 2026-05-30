import type { CSSProperties } from "react";
import { createPortal } from "react-dom";

export default function EndGameModal({
    success,
    onClose,
    onNewGame,
}: {
    success: boolean;
    onClose: () => void;
    onNewGame: () => void;
}) {
    const message = success
        ? "Поздравляем, уровень пройден"
        : "К сожалению, решение неправильное.";

    const palette = success
        ? {
            frame: "#7BC5F0",
            bg: "#1E9AD8",
            buttonBorder: "#0D78B4",
            buttonBg: "#45B2E6",
            buttonShadow: "#9AD8F4",
            closeBorder: "#E8F6FF",
            closeColor: "#E8F6FF",
        }
        : {
            frame: "#F2A1A1",
            bg: "#D64545",
            buttonBorder: "#9F2E2E",
            buttonBg: "#E55B5B",
            buttonShadow: "#F3A5A5",
            closeBorder: "#FFE1E1",
            closeColor: "#FFE1E1",
        };

    const actionButtonStyle: CSSProperties = {
        borderRadius: 16,
        border: `4px solid ${palette.buttonBorder}`,
        background: palette.buttonBg,
        padding: "12px",
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: "#fff",
        cursor: "pointer",
        boxShadow: `inset 0 2px 0 ${palette.buttonShadow}`,
    };

    return createPortal(
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(0,0,0,0.4)",
                padding: "16px",
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    maxWidth: "420px",
                    borderRadius: "28px",
                    border: `4px solid ${palette.frame}`,
                    background: palette.bg,
                    padding: "32px 24px",
                    textAlign: "center",
                }}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        right: 16,
                        top: 16,
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        border: `2px solid ${palette.closeBorder}`,
                        background: "transparent",
                        color: palette.closeColor,
                        fontSize: 18,
                        fontWeight: "bold",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                    aria-label="Закрыть"
                >
                    ×
                </button>

                <div
                    style={{
                        marginBottom: 24,
                        fontSize: 20,
                        fontWeight: 600,
                        color: "#fff",
                    }}
                >
                    {message}
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: success ? "1fr 1fr" : "1fr",
                        gap: 16,
                    }}
                >
                    {success && (
                        <button onClick={onNewGame} style={actionButtonStyle}>
                            Новая игра
                        </button>
                    )}
                    <button onClick={onClose} style={actionButtonStyle}>
                        OK
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}