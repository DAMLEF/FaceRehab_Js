# test_send.py — à lancer une fois pour vérifier
import socket
import struct
import time
import uuid

UNREAL_IP, UNREAL_PORT = "127.0.0.1", 11111
SUBJECT = "MediPipeFace"
DEVICE_UUID = str(uuid.uuid4())

buf = bytearray()
buf += struct.pack(">i", 6)
uuid_b = DEVICE_UUID.encode()
buf += struct.pack(">B", len(uuid_b))
buf += uuid_b
name_b = SUBJECT.encode()     
buf += struct.pack(">B", len(name_b)) 
buf += name_b
buf += struct.pack(">i", 52)
for _ in range(52): 
    buf += struct.pack(">f", 0.0)
for _ in range(7):  
    buf += struct.pack(">f", 0.0)  # head rot + eyes
buf += struct.pack(">i", 0)
buf += struct.pack(">d", time.time())

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.sendto(bytes(buf), (UNREAL_IP, UNREAL_PORT))
print("Paquet envoyé !")