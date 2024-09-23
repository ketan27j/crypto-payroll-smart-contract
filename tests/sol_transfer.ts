import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolTransfer } from "../target/types/sol_transfer";
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import { assert } from "chai";

describe("sol_transfer", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.solTransfer as Program<SolTransfer>;
 
  const sender : PublicKey = new PublicKey("4L5XRZ1Qqn6mBMdBpG8abghXAP6Xva5aevoMnqnWKV2c");
  const receiver: PublicKey = new PublicKey("3ea1MKRLhtMhR4EQ75gwi3ynxKNe9XkDvQ38Y8kCk7ZA");

  it("Transfers SOL from sender to receiver", async () => {
    // Check initial balances
    const initialSenderBalance = await provider.connection.getBalance(sender);
    const initialReceiverBalance = await provider.connection.getBalance(receiver);
    console.log("Initial sender balance:", initialSenderBalance);
    console.log("Initial receiver balance:", initialReceiverBalance);
    const amount = new anchor.BN(1e8);
    const scheduledTime = new anchor.BN(Date.now() / 1000 + 60);
    // Execute the transfer
    const tx = await program.methods.transferSol(amount,scheduledTime).accounts({
      sender: sender,
      receiver: receiver,
      systemProgram: SystemProgram.programId,
    }).rpc();

    // Check final balances
    const finalSenderBalance = await provider.connection.getBalance(sender);
    const finalReceiverBalance = await provider.connection.getBalance(receiver);
    console.log("Final sender balance:", finalSenderBalance);
    console.log("Final receiver balance:", finalReceiverBalance);
    // Assert balances
    assert.equal(finalSenderBalance, initialSenderBalance - amount.toNumber() - 5000);
    assert.equal(finalReceiverBalance, initialReceiverBalance + amount.toNumber());
    console.log("Your transaction signature", tx);
  });
});
