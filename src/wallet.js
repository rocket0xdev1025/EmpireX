function providers() {
  const ethereum = window.ethereum;
  if (!ethereum) return [];
  return ethereum.providers?.length ? [...ethereum.providers] : [ethereum];
}

export function detectProvider(id) {
  const list = providers();
  if (id === "metamask") return list.find((provider) => provider.isMetaMask && !provider.isPhantom && !provider.isRabby) ?? null;
  if (id === "phantom") return window.phantom?.ethereum ?? list.find((provider) => provider.isPhantom) ?? null;
  if (id === "rabby") return list.find((provider) => provider.isRabby) ?? null;
  if (id === "browser") return window.ethereum ?? null;
  return null;
}

export function walletInstalled(id) {
  return Boolean(detectProvider(id));
}

export async function requestAccount(id) {
  const provider = detectProvider(id);
  if (!provider) {
    const error = new Error("Wallet is not installed in this browser.");
    error.code = "not-installed";
    throw error;
  }
  const accounts = await provider.request({ method: "eth_requestAccounts" });
  const address = accounts?.[0];
  if (!address) throw new Error("No account was returned.");
  return address;
}

export function walletLinks() {
  const page = window.location.href;
  const host = `${window.location.host}${window.location.pathname}`;
  return {
    metamask: `https://link.metamask.io/dapp/${host}`,
    phantom: `https://phantom.com/ul/browse/${encodeURIComponent(page)}?ref=${encodeURIComponent(window.location.origin)}`,
  };
}
