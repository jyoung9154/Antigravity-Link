import time
import requests
import os
import sys

# ==========================================
# 텔레그램 봇 토큰을 여기에 입력하세요
TOKEN = "YOUR_TELEGRAM_BOT_TOKEN"
# ==========================================

BASE_URL = f"https://api.telegram.org/bot{TOKEN}"
# 절대 경로를 사용합니다.
TASK_FILE = "/Users/jaeyoung/.gemini/antigravity/playground/velvet-aphelion/remote_tasks.md"

def check_token():
    if TOKEN == "YOUR_TELEGRAM_BOT_TOKEN":
        print("에러: telegram_bridge.py 파일의 TOKEN 변수에 실제 텔레그램 봇 토큰을 입력해야 합니다.")
        sys.exit(1)

def main():
    check_token()
    offset = 0
    
    # 작업 파일 초기화 (없을 경우)
    if not os.path.exists(TASK_FILE):
        with open(TASK_FILE, "w", encoding="utf-8") as f:
            f.write("# Mobile Remote Tasks\n\n")
            f.write("이 파일은 모바일에서 전송된 작업 목록입니다.\n\n")
    
    print(f"--- Antigravity Mobile Bridge 시작 ---")
    print(f"작업 파일 경로: {TASK_FILE}")
    print("메시지를 기다리는 중... (종료하려면 Ctrl+C)")

    while True:
        try:
            # 롱 폴링(Long Polling) 사용
            url = f"{BASE_URL}/getUpdates?offset={offset}&timeout=30"
            response = requests.get(url, timeout=35).json()
            
            if response.get("ok"):
                for result in response["result"]:
                    offset = result["update_id"] + 1
                    if "message" in result and "text" in result["message"]:
                        msg = result["message"]
                        text = msg["text"]
                        user_name = msg["from"].get("username") or msg["from"].get("first_name", "Unknown")
                        
                        timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
                        log_entry = f"## [{timestamp}] From: @{user_name}\n\n{text}\n\n---\n\n"
                        
                        with open(TASK_FILE, "a", encoding="utf-8") as f:
                            f.write(log_entry)
                        
                        print(f"[{timestamp}] 수신: {text} (@{user_name})")
                        
                        # 사용자에게 수신 확인 메시지 전송 (옵션)
                        chat_id = msg["chat"]["id"]
                        requests.post(f"{BASE_URL}/sendMessage", data={
                            "chat_id": chat_id,
                            "text": "✅ 작업을 접수했습니다. PC의 Antigravity가 확인 중입니다."
                        })
            else:
                print(f"API 에러: {response.get('description')}")
                
        except KeyboardInterrupt:
            print("\n브릿지를 종료합니다.")
            break
        except Exception as e:
            print(f"오류 발생: {e}")
            time.sleep(5)

if __name__ == "__main__":
    main()
