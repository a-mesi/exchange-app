import Link from "next/link";
import { Button } from "../ui/button";

import { QuoteResponse } from "@/app/api/types/index";
import { useSendTransaction, useWaitForTransactionReceipt } from "wagmi";

interface Props {
    quote: QuoteResponse | undefined;
    setFinalize: (value: boolean) => void;
}

export default function ConfirmSwapButton({ quote, setFinalize }: Props) {
    const {
        data: swapTxHash,
        isPending,
        sendTransaction,
    } = useSendTransaction();

    const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({
            hash: swapTxHash,
        });

    if (!quote) {
        return <div>Getting best quote...</div>;
    }

    return (
        <div className="flex flex-col gap-y-2">
            <Button
                variant="ghost"
                onClick={(event) => {
                    event.preventDefault();
                    setFinalize(false);
                }}
            >
                Modify swap
            </Button>
            <Button
                disabled={isPending}
                onClick={(event) => {
                    event.preventDefault();

                    sendTransaction &&
                        sendTransaction({
                            gas: quote?.gas,
                            to: quote?.to,
                            value: quote?.value, // only used for native tokens
                            data: quote?.data,
                            gasPrice: quote?.gasPrice,
                        });
                }}
            >
                {isPending ? "Confirming..." : "Place Order"}
            </Button>
            {swapTxHash && (
                <div className="pt-4 flex flex-col items-center">
                    <Link
                        className="hover:text-accent flex items-center gap-x-1.5"
                        href={`https://polygonscan.com/tx/${swapTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        View tx on explorer
                    </Link>
                    {isConfirming && <div>Waiting for confirmation...</div>}
                    {isConfirmed && <div>Transaction confirmed.</div>}
                </div>
            )}
        </div>
    );
}
