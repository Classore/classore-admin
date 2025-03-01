export interface CloudinaryAsset {
	public_id: string;
	format: string;
	version: number;
	resource_type: string;
	type: string;
	created_at: string;
	bytes: number;
	width: number;
	height: number;
	secure_url: string;
}

export type CloudinaryAssetResponse = {
	id: string;
	batchId: string;
	name: string;
	size: number;
	type: string;
	imageDimensions: [];
	status: string;
	progress: number;
	done: true;
	failed: boolean;
	aborted: boolean;
	paused: boolean;
	partOfBatch: boolean;
	publicId: "";
	preparedParams: object;
	camera: boolean;
	coordinatesResize: boolean;
	delayedPreCalls: boolean;
	publicIdCounter: number;
	isFetch: boolean;
	statusText: string;
	uploadedAt: number;
	uploadInfo: {
		asset_id: string;
		public_id: string;
		version: number;
		version_id: string;
		signature: string;
		width: number;
		height: number;
		format: string;
		resource_type: string;
		created_at: Date | string;
		tags: string[];
		pages: number;
		bytes: number;
		type: string;
		etag: string;
		placeholder: boolean;
		url: string;
		secure_url: string;
		playback_url: string;
		folder: string;
		access_mode: string;
		existing: boolean;
		audio: {
			codec: string;
			bit_rate: string;
			frequency: number;
			channels: number;
			channel_layout: string;
		};
		video: {
			pix_format: string;
			codec: string;
			level: number;
			profile: string;
			bit_rate: string;
			time_base: string;
			metadata: {
				encoded_date: Date;
				tagged_date: Date;
			};
		};
		is_audio: boolean;
		frame_rate: number;
		bit_rate: number;
		duration: number;
		rotation: number;
		nb_frames: number;
		path: string;
		thumbnail_url: string;
	};
	timeout: boolean;
};
