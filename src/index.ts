// Nhập các thư viện cần thiết
import { ethers } from "ethers";
import * as readline from "readline";

// Tạo đối tượng readline để nhập dữ liệu từ bàn phím
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Địa chỉ RPC của mạng Ronin Saigon (không dùng API bên ngoài)
const RONIN_SAIGON_RPC = "https://saigon-testnet.roninchain.com/rpc";

// Định nghĩa ABI cơ bản của ERC20 chỉ cần cho balanceOf và decimals
const ERC20_ABI = [
  // Lấy số dư token của một địa chỉ
  "function balanceOf(address owner) view returns (uint256)",
  // Lấy số thập phân của token
  "function decimals() view returns (uint8)",
  // Lấy tên token (tùy chọn, để hiển thị đẹp hơn)
  "function name() view returns (string)",
  // Lấy ký hiệu token (tùy chọn)
  "function symbol() view returns (string)"
];

async function main() {
  console.log("=== Kiểm tra số dư Token ERC20 trên Ronin Saigon ===\n");

  // Nhập địa chỉ ví từ người dùng
  const walletAddress = await new Promise<string>((resolve) => {
    rl.question("Nhập địa chỉ ví (wallet address): ", (answer) => {
      resolve(answer.trim());
    });
  });

  // Nhập địa chỉ hợp đồng ERC20 từ người dùng
  const tokenAddress = await new Promise<string>((resolve) => {
    rl.question("Nhập địa chỉ hợp đồng ERC20: ", (answer) => {
      resolve(answer.trim());
    });
  });

  // Kết nối tới mạng Ronin Saigon bằng ethers.js
  const provider = new ethers.JsonRpcProvider(RONIN_SAIGON_RPC);

  // Tạo đối tượng đại diện cho token ERC20
  const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

  try {
    // Lấy số dư token (dưới dạng số nguyên lớn)
    const rawBalance = await tokenContract.balanceOf(walletAddress);
    // Lấy số thập phân của token
    const decimals = await tokenContract.decimals();
    // Lấy tên và ký hiệu token (nếu có)
    let name = "";
    let symbol = "";
    try {
      name = await tokenContract.name();
      symbol = await tokenContract.symbol();
    } catch (e) {
      // Nếu không lấy được thì bỏ qua
    }
    // Chuyển số dư về dạng thập phân thực tế
    // Sử dụng BigInt cho cả rawBalance và decimals
    const balance = Number(rawBalance) / Number(10n ** BigInt(decimals));

    // Hiển thị kết quả
    console.log("\n--- Kết quả ---");
    if (name && symbol) {
      console.log(`Số dư: ${balance} ${symbol} (${name})`);
    } else {
      console.log(`Số dư: ${balance} token (decimals: ${decimals})`);
    }
  } catch (error) {
    console.error("Đã xảy ra lỗi khi lấy số dư hoặc thông tin token. Vui lòng kiểm tra lại địa chỉ.");
    console.error(error);
  } finally {
    // Đóng readline
    rl.close();
  }
}

// Gọi hàm chính
main(); 