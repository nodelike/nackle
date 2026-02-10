import { useState, useCallback, useRef, memo } from "react";

const st = {
    container: {
        flex: 1,
        overflowY: "auto",
        padding: "12px 32px 32px",
    },
    heading: {
        fontSize: 13,
        fontWeight: 600,
        color: "var(--fg-muted)",
        fontFamily: "'JetBrains Mono Nerd Font', 'JetBrains Mono', monospace",
        letterSpacing: 1,
        textTransform: "uppercase",
        marginTop: 28,
        marginBottom: 14,
        paddingBottom: 8,
        borderBottom: "1px solid var(--border)",
    },
    row: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 0",
        borderBottom: "1px solid rgba(255,255,255,0.02)",
    },
    label: {
        fontSize: 14,
        color: "var(--fg)",
        fontFamily: "'JetBrains Mono Nerd Font', 'JetBrains Mono', monospace",
        opacity: 0.85,
    },
    hint: {
        fontSize: 11,
        color: "var(--fg-muted)",
        fontFamily: "'JetBrains Mono Nerd Font', 'JetBrains Mono', monospace",
        marginTop: 3,
        opacity: 0.7,
    },
    toggle: {
        width: 36,
        height: 18,
        borderRadius: 0,
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "var(--border)",
        background: "var(--surface)",
        cursor: "pointer",
        position: "relative",
        flexShrink: 0,
    },
    toggleOn: {
        background: "color-mix(in srgb, var(--accent) 15%, transparent)",
        borderColor: "color-mix(in srgb, var(--accent) 40%, transparent)",
    },
    toggleKnob: {
        position: "absolute",
        top: 2,
        width: 12,
        height: 12,
        background: "var(--fg-muted)",
        borderRadius: 0,
        transition: "left 0.15s ease",
    },
    toggleKnobOn: {
        background: "var(--accent)",
    },
    // Custom slider
    sliderTrack: {
        width: 160,
        height: 20,
        position: "relative",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
    },
    sliderRail: {
        position: "absolute",
        left: 0,
        right: 0,
        height: 2,
        background: "var(--border)",
    },
    sliderFill: {
        position: "absolute",
        left: 0,
        height: 2,
        background: "var(--accent)",
    },
    sliderThumb: {
        position: "absolute",
        width: 10,
        height: 10,
        background: "var(--accent)",
        borderRadius: 0,
        transform: "translateX(-50%)",
        cursor: "grab",
    },
    sliderThumbActive: {
        cursor: "grabbing",
        background: "var(--fg)",
    },
    sliderValue: {
        fontSize: 11,
        color: "var(--fg-muted)",
        fontFamily: "'JetBrains Mono Nerd Font', 'JetBrains Mono', monospace",
        minWidth: 32,
        textAlign: "right",
    },
    // Theme picker
    themeGrid: {
        display: "flex",
        gap: 10,
        marginTop: 8,
        flexWrap: "wrap",
    },
    themeCard: {
        padding: "10px 16px",
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "var(--border)",
        cursor: "pointer",
        transition: "background 0.15s ease",
        display: "flex",
        alignItems: "center",
        gap: 10,
        minWidth: 140,
    },
    themeCardActive: {
        borderColor: "var(--accent)",
    },
    themeSwatches: {
        display: "flex",
        gap: 3,
    },
    themeSwatch: {
        width: 10,
        height: 10,
        borderRadius: 0,
    },
    themeName: {
        fontSize: 13,
        fontFamily: "'JetBrains Mono Nerd Font', 'JetBrains Mono', monospace",
        color: "var(--fg)",
        opacity: 0.85,
    },
    themeNameActive: {
        color: "var(--accent)",
        opacity: 1,
    },
    // Danger zone
    dangerSection: {
        marginTop: 40,
        padding: "20px 0",
        borderTop: "1px solid var(--border)",
    },
    dangerLabel: {
        fontSize: 13,
        color: "var(--danger)",
        fontWeight: 500,
        marginBottom: 6,
    },
    dangerHint: {
        fontSize: 12,
        color: "var(--fg-muted)",
        marginBottom: 16,
    },
    dangerBtn: {
        background: "none",
        border: "1px solid var(--border)",
        color: "var(--fg-muted)",
        fontSize: 12,
        fontFamily: "'JetBrains Mono Nerd Font', 'JetBrains Mono', monospace",
        padding: "6px 16px",
        borderRadius: 0,
        cursor: "pointer",
        transition: "border-color 0.15s, color 0.15s",
    },
    confirmOverlay: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
    },
    confirmBox: {
        background: "rgb(var(--bg-rgb) / 0.9)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.06)",
        padding: "24px 28px",
        maxWidth: 360,
        width: "100%",
    },
    confirmTitle: {
        fontSize: 16,
        fontWeight: 600,
        color: "var(--danger)",
        marginBottom: 10,
    },
    confirmText: {
        fontSize: 13,
        color: "var(--fg-muted)",
        lineHeight: 1.6,
        marginBottom: 20,
    },
    confirmActions: {
        display: "flex",
        gap: 10,
        justifyContent: "flex-end",
    },
    cancelBtn: {
        background: "none",
        border: "1px solid var(--border)",
        color: "var(--fg-muted)",
        fontSize: 12,
        fontFamily: "'JetBrains Mono Nerd Font', 'JetBrains Mono', monospace",
        padding: "6px 16px",
        borderRadius: 0,
        cursor: "pointer",
        transition: "border-color 0.15s, color 0.15s",
    },
    confirmDeleteBtn: {
        background: "none",
        border: "1px solid var(--danger)",
        color: "var(--danger)",
        fontSize: 12,
        fontFamily: "'JetBrains Mono Nerd Font', 'JetBrains Mono', monospace",
        fontWeight: 500,
        padding: "6px 16px",
        borderRadius: 0,
        cursor: "pointer",
        transition: "border-color 0.15s, color 0.15s",
    },
};

function Toggle({ value, onChange }) {
    const on = value === "true";
    return (
        <div style={{ ...st.toggle, ...(on ? st.toggleOn : {}) }} onClick={() => onChange(on ? "false" : "true")}>
            <div
                style={{
                    ...st.toggleKnob,
                    ...(on ? st.toggleKnobOn : {}),
                    left: on ? 20 : 2,
                }}
            />
        </div>
    );
}

function Slider({ min, max, step, value, onChange }) {
    const trackRef = useRef(null);
    const [dragging, setDragging] = useState(false);

    const clamp = (v) => Math.min(max, Math.max(min, v));
    const pct = ((value - min) / (max - min)) * 100;

    const valueFromX = (clientX) => {
        const rect = trackRef.current.getBoundingClientRect();
        const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
        const raw = min + ratio * (max - min);
        // Snap to step
        const stepped = Math.round(raw / step) * step;
        return clamp(parseFloat(stepped.toFixed(10)));
    };

    const handlePointerDown = (e) => {
        e.preventDefault();
        setDragging(true);
        onChange(valueFromX(e.clientX));
        const onMove = (ev) => onChange(valueFromX(ev.clientX));
        const onUp = () => {
            setDragging(false);
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
        };
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
    };

    return (
        <div ref={trackRef} style={st.sliderTrack} onPointerDown={handlePointerDown}>
            <div style={st.sliderRail} />
            <div style={{ ...st.sliderFill, width: `${pct}%` }} />
            <div
                style={{
                    ...st.sliderThumb,
                    ...(dragging ? st.sliderThumbActive : {}),
                    left: `${pct}%`,
                }}
            />
        </div>
    );
}

const Settings = memo(function Settings({ settings, onSaveSetting, onWipeAllData, themes, currentTheme, appVersion }) {
    const [confirmWipe, setConfirmWipe] = useState(false);

    const save = useCallback(
        (key, value) => {
            onSaveSetting(key, value);
        },
        [onSaveSetting],
    );

    const frameless = settings.frameless || "false";
    const bgOpacity = parseFloat(settings["background-opacity"]) || 1;
    const bgBlurRadius = parseInt(settings["background-blur-radius"]) || 0;

    return (
        <div style={st.container}>
            {/* Theme section */}
            <div style={st.heading}>Theme</div>

            <div style={st.themeGrid}>
                {Object.entries(themes).map(([key, t]) => {
                    const isActive = currentTheme === key;
                    return (
                        <div key={key} style={{ ...st.themeCard, ...(isActive ? st.themeCardActive : {}) }} onClick={() => save("theme", key)}>
                            <div style={st.themeSwatches}>
                                <div style={{ ...st.themeSwatch, background: t.background }} />
                                <div style={{ ...st.themeSwatch, background: t.accent }} />
                                <div style={{ ...st.themeSwatch, background: t.accentSecondary }} />
                                <div style={{ ...st.themeSwatch, background: t.danger }} />
                            </div>
                            <span style={{ ...st.themeName, ...(isActive ? st.themeNameActive : {}) }}>{t.name}</span>
                        </div>
                    );
                })}
            </div>

            {/* Window section */}
            <div style={st.heading}>Window</div>

            <div style={st.row}>
                <div>
                    <div style={st.label}>Frameless window</div>
                    <div style={st.hint}>No titlebar, no close/minimize/maximize buttons. Requires restart.</div>
                </div>
                <Toggle value={frameless} onChange={(v) => save("frameless", v)} />
            </div>

            <div style={st.heading}>Background</div>

            <div style={st.row}>
                <div>
                    <div style={st.label}>background-opacity</div>
                    <div style={st.hint}>0.0 = see-through, 1.0 = solid. Content stays fully opaque.</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Slider min={0.05} max={1} step={0.05} value={bgOpacity} onChange={(v) => save("background-opacity", String(v))} />
                    <span style={st.sliderValue}>{bgOpacity.toFixed(2)}</span>
                </div>
            </div>

            <div style={st.row}>
                <div>
                    <div style={st.label}>background-blur-radius</div>
                    <div style={st.hint}>0 = no blur. Higher = more blur. Only visible when opacity &lt; 1.</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Slider min={0} max={80} step={1} value={bgBlurRadius} onChange={(v) => save("background-blur-radius", String(v))} />
                    <span style={st.sliderValue}>{bgBlurRadius}</span>
                </div>
            </div>

            {/* Danger zone */}
            <div style={st.dangerSection}>
                <div style={st.dangerLabel}>Danger zone</div>
                <div style={st.dangerHint}>Permanently delete all collections, todos, and archived items. Settings are preserved.</div>
                <button className="danger-btn" style={st.dangerBtn} onClick={() => setConfirmWipe(true)}>
                    Wipe all data
                </button>
            </div>

            {/* Version */}
            {appVersion && (
                <div style={{ marginTop: 32, fontSize: 11, color: "var(--fg-muted)", opacity: 0.4 }}>
                    Nackle v{appVersion}
                </div>
            )}

            {/* Confirm dialog */}
            {confirmWipe && (
                <div style={st.confirmOverlay} onClick={() => setConfirmWipe(false)}>
                    <div style={st.confirmBox} onClick={(e) => e.stopPropagation()}>
                        <div style={st.confirmTitle}>Wipe all data?</div>
                        <div style={st.confirmText}>
                            This will permanently delete all your collections, todos, and archived items. Only Inbox and settings will remain. This
                            cannot be undone.
                        </div>
                        <div style={st.confirmActions}>
                            <button style={st.cancelBtn} onClick={() => setConfirmWipe(false)}>
                                Cancel
                            </button>
                            <button
                                style={st.confirmDeleteBtn}
                                onClick={() => {
                                    setConfirmWipe(false);
                                    onWipeAllData();
                                }}>
                                Wipe everything
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

export default Settings;
