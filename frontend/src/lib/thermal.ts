/**
 * Prints plain text / ESC-POS formatting to standard Bluetooth thermal printer (58mm/80mm)
 * using Web Bluetooth API directly from Chromium browsers.
 */
export async function printViaBluetooth(text: string): Promise<boolean> {
  const nav = navigator as unknown as {
    bluetooth?: {
      requestDevice(options: unknown): Promise<{
        gatt?: {
          connect(): Promise<{
            getPrimaryServices(): Promise<Array<{
              getCharacteristics(): Promise<Array<{
                writeValue(data: BufferSource): Promise<void>;
              }>>;
            }>>;
          }>;
        };
      }>;
    };
  };

  if (!nav.bluetooth) {
    alert("Web Bluetooth tidak didukung di browser ini. Gunakan Google Chrome di Android atau Desktop.");
    return false;
  }

  try {
    const device = await nav.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [
        "000018f0-0000-1000-8000-00805f9b34fb",
        "e7810a71-73ae-499d-8c15-faa9aef0c3f2",
        "49535343-fe7d-4ae5-8fa9-9fafd205e455",
      ],
    });

    const server = await device.gatt?.connect();
    if (!server) throw new Error("Gagal terhubung ke GATT server printer");

    const services = await server.getPrimaryServices();
    if (!services || services.length === 0) throw new Error("Service Bluetooth tidak ditemukan");

    let targetCharacteristic;
    for (const s of services) {
      try {
        const chars = await s.getCharacteristics();
        if (chars && chars.length > 0) {
          targetCharacteristic = chars[0];
          break;
        }
      } catch {
        // Continue searching next service
      }
    }

    if (!targetCharacteristic) {
      throw new Error("Karakteristik write Bluetooth tidak ditemukan");
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    // Send in chunks of 100 bytes
    const chunkSize = 100;
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      await targetCharacteristic.writeValue(chunk);
    }

    return true;
  } catch (err: unknown) {
    console.error("Bluetooth print error:", err);
    alert(`Gagal mencetak: ${(err as Error).message}`);
    return false;
  }
}
