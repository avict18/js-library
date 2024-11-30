import time
import datetime
import csv
from colorama import Fore, Style
import pyfiglet
import speedtest

reecord = 'record.csv'
serial_number = 1
start_time = time.time()
banner = pyfiglet.figlet_format("SPEED 1.0.1")
print(Fore.GREEN + banner + Style.RESET_ALL)
print(Fore.LIGHTMAGENTA_EX + "Built by Avict18" + Style.RESET_ALL)
high = float(input(Fore.MAGENTA + "please place the speed to rank as great!: " + Fore.GREEN))
low = float(input(Fore.MAGENTA + "please place the minimum speed that is expected: " + Fore.RED))

def speed_test():
    st = speedtest.Speedtest()  
    st.get_best_server()

    # Perform the speed test
    download_speed = st.download() / 1_000_000 
    upload_speed = st.upload() / 1_000_000 
    ping = st.results.ping
    current_time = datetime.datetime.now()
    status = ""

    if download_speed >= high:
        status = "great"
    elif download_speed <= low:
        status = "bad"
    else:
        status = "okay"

    print(Style.RESET_ALL)
    print(Fore.CYAN + f'Data recorded')
    print(Fore.GREEN + f'Download speed: {download_speed: <10}Mbps\t' + Fore.YELLOW + f'Upload speed: {upload_speed: <10}Mbps\t' + Fore.CYAN + f'Ping: {ping:.2f}ms')  
    print(Style.RESET_ALL)
    if status == "great":
        print("STATUS: " + Fore.LIGHTGREEN_EX + "great")
    elif status == "okay":
        print("STATUS: " + Fore.LIGHTBLUE_EX + "okay")
    else:
        print("STATUS: " + Fore.RED + "bad")
    print(Fore.RED + "=" * 20)

    with open(reecord, mode='a') as file:
        file_writer = csv.writer(file)
        file_writer.writerow([serial_number, current_time, f"{download_speed:.2f}", f"{upload_speed:.2f}", f"{ping:.2f}" , status]) 

if __name__ == "__main__":
    while True:
        speed_test()
        serial_number += 1
        time.sleep(60)
