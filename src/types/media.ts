import type { PlaylistProps } from "./course";
import type { Pagination } from "./roleAndPermission";

export interface MediaProps {
    id: number,
    file_name: string,
    url: string,
    size: number
    alt?: string;
    is_downloadable?: boolean;
}

export interface MediaList {
    data: {
        data: MediaProps[],
        pagination: Pagination
    }
}

export interface PlaylistListing {
    data: {
        data: PlaylistProps[],
        pagination: Pagination
    }
}

export interface PlaylistDetail {
    data: {
        data: MediaProps[],
        pagination: Pagination
    }
}