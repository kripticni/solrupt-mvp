import type { RequestHandler } from "./$types.js";
import { buildRoomFiles } from "$lib/server/rooms/files.js";

// Download-and-hack-locally: the room bundle as a fresh .zip (README +
// template + source + manifest). GET only, no session needed; everything
// inside is already public on the room page.
export const GET: RequestHandler = async ({ params }) => {
	const out = buildRoomFiles(params.id ?? "");
	if ("error" in out) {
		return new Response(JSON.stringify({ error: "RoomMissing", action: "pick a live room from the picker" }), {
			status: 404,
			headers: { "Content-Type": "application/json" }
		});
	}
	return new Response(Buffer.from(out.bytes), {
		status: 200,
		headers: {
			"Content-Type": "application/zip",
			"Content-Disposition": `attachment; filename="${out.filename}"`
		}
	});
};
