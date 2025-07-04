import axios from "axios";
import type { AxiosResponse, InternalAxiosRequestConfig, AxiosRequestHeaders } from "axios";
import type { ItemData } from "../interface/ItemData";
import { useQuery } from "@tanstack/react-query";

const API_URL = 'http://localhost:8080/api/market/items';

// fetchData returns a Promise resolving to AxiosResponse<ItemData[]>
const fetchData = async (itemName: string): Promise<AxiosResponse<ItemData[]>> => {
    if (!itemName.trim()) {
        // Return a resolved promise with an empty array in the same shape as AxiosResponse
        const emptyConfig: InternalAxiosRequestConfig = { url: '', method: 'get', headers: {} as AxiosRequestHeaders };
        return Promise.resolve({ data: [], status: 200, statusText: 'OK', headers: {}, config: emptyConfig });
    }
    return axios.get(`${API_URL}?item_name=${encodeURIComponent(itemName)}`);
};

export function useItemData(itemName: string, fetchTrigger: number) {
    const query = useQuery<AxiosResponse<ItemData[]>, Error>({
        queryFn: () => fetchData(itemName),
        queryKey: ['item-data', itemName, fetchTrigger],
        enabled: !!itemName.trim(),
        retry: 2,
    });

    // Always return an array for data
    return {
        ...query,
        data: query.data?.data || []
    };
}