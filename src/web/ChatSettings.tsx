import React, { useState, useEffect, useRef } from "react";
import styles from "./ChatSettings.module.css";
import { ChatSettings as ChatSettingsType } from "./types";

interface ChatSettingsProps {
  chatId: string;
  settings: ChatSettingsType;
  onSave: (settings: ChatSettingsType, doNotClose?: boolean) => void;
  onClose: () => void;
}

export function ChatSettings({
  chatId,
  settings: initialSettings,
  onSave,
  onClose,
}: ChatSettingsProps) {
  const [settings, setSettings] = useState<ChatSettingsType>(initialSettings);
  const [newServer, setNewServer] = useState("");
  const [newHeaderKey, setNewHeaderKey] = useState("");
  const [newHeaderValue, setNewHeaderValue] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        handleSubmit(event as unknown as React.FormEvent);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(settings);
  };

  const addServer = (e?: React.FormEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (newServer.trim()) {
      const newSettings = {
        ...settings,
        servers: [...(settings.servers || []), newServer.trim()],
      };
      setSettings(newSettings);
      setNewServer("");
      onSave(newSettings, true);
    }
  };

  const removeServer = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      servers: prev.servers?.filter((_, i) => i !== index),
    }));
  };

  const addHeader = (e?: React.FormEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (newHeaderKey.trim()) {
      const newSettings = {
        ...settings,
        headers: {
          ...(settings.headers || {}),
          [newHeaderKey.trim()]: newHeaderValue.trim(),
        },
      };
      setSettings(newSettings);
      setNewHeaderKey("");
      setNewHeaderValue("");
      onSave(newSettings, true);
    }
  };

  const removeHeader = (key: string) => {
    setSettings((prev) => {
      const updated = { ...(prev.headers || {}) };
      delete updated[key];
      return { ...prev, headers: updated };
    });
  };

  return (
    <div className={styles.settingsOverlay}>
      <div className={styles.settingsModal} ref={modalRef}>
        <h2>Chat Settings</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="title">Title:</label>
            <input
              type="text"
              id="title"
              value={settings.title}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="model">Model:</label>
            <input
              type="text"
              id="model"
              value={settings.model}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, model: e.target.value }))
              }
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="systemPrompt">System Prompt:</label>
            <textarea
              id="systemPrompt"
              value={settings.systemPrompt || ""}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  systemPrompt: e.target.value,
                }))
              }
              rows={4}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Servers:</label>
            <div className={styles.serversList}>
              {settings.servers?.map((server, index) => (
                <div key={index} className={styles.serverItem}>
                  <span>{server}</span>
                  <button
                    type="button"
                    onClick={() => removeServer(index)}
                    className={styles.removeButton}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className={styles.addServer}>
              <input
                type="text"
                value={newServer}
                onChange={(e) => setNewServer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.stopPropagation();
                    addServer();
                  }
                }}
                placeholder="Enter server path"
              />
              <button type="button" onClick={addServer}>
                Add Server
              </button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>HTTP Headers (for SSE servers):</label>
            <div className={styles.serversList}>
              {Object.entries(settings.headers || {}).map(([key, value]) => (
                <div key={key} className={styles.serverItem}>
                  <span>{key}: {value}</span>
                  <button
                    type="button"
                    onClick={() => removeHeader(key)}
                    className={styles.removeButton}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className={styles.addServer}>
              <input
                type="text"
                value={newHeaderKey}
                onChange={(e) => setNewHeaderKey(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.stopPropagation();
                    addHeader();
                  }
                }}
                placeholder="Header name"
              />
              <input
                type="text"
                value={newHeaderValue}
                onChange={(e) => setNewHeaderValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.stopPropagation();
                    addHeader();
                  }
                }}
                placeholder="Header value"
              />
              <button type="button" onClick={addHeader}>
                Add Header
              </button>
            </div>
          </div>

          <div className={styles.actions}>
            <button type="submit" className={styles.saveButton}>
              Save Settings
            </button>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
