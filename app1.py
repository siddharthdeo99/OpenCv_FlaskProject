from flask import Flask,render_template,Response
import cv2
import csv
from cvzone.HandTrackingModule import HandDetector as HD1
from sidzone.HandTrackingModule import HandDetector as HD
from time import sleep
import cvzone
import time
from flask.scaffold import F
import numpy as np
import sidzone
from tracker import *
from pynput.keyboard import Controller

app=Flask(__name__)
cap=cv2.VideoCapture(0)
cap1 = cv2.VideoCapture("highway.mp4")
cap.set(3, 1280)
cap.set(4, 720)

object_detector = cv2.createBackgroundSubtractorMOG2(history=100, varThreshold=40)
            
detector = HD(detectionCon=0.8)
detector1= HD1(detectionCon=0.8)
keys = [["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
        ["A", "S", "D", "F", "G", "H", "J", "K", "L", ";"],
        ["Z", "X", "C", "V", "B", "N", "M", ",", ".", "/"]]
finalText = ""


# import pafy
# Create tracker object
tracker = EuclideanDistTracker()
# /----------------------------------------/
#     FOR yt video 
# /----------------------------------------/
# url = "https://www.youtube.com/watch?v=CW0WhBJSxIY"
# video = pafy.new(url)
# best  = video.getbest(preftype="mp4")
# cap = cv2.VideoCapture()
# cap.open(best.url)


class MCQ():
    def __init__(self,data):
        self.question= data[0]
        self.choice1= data[1]
        self.choice2= data[2]
        self.choice3= data[3]
        self.choice4= data[4]
        self.answer = int(data[5])
        self.userAns = None
    
    def update(self,cursor,bboxs,img):
        for x,bbox in enumerate(bboxs):
            x1,y1,x2,y2=bbox
            if x1<cursor[0]<x2 and y1<cursor[1]<y2:
                self.userAns = x+1
                cv2.rectangle(img,(x1,y1),(x2,y2),(0,255,0),cv2.FILLED)


pathCSV= "mcqs.csv"
with open(pathCSV,newline='\n') as f:
    reader = csv.reader(f)
    dataAll = list(reader)[1:]

mcqlist = []
for q in dataAll:
    mcqlist.append(MCQ(q))


qno= 0 
qtotal=len(dataAll)
           
keyboard = Controller()
def drawAll(img, buttonList):
    for button in buttonList:
        x, y = button.pos
        w, h = button.size
        sidzone.cornerRect(img, (button.pos[0], button.pos[1], button.size[0], button.size[1]),
                          20, rt=0)
        cv2.rectangle(img, button.pos, (x + w, y + h), (255, 0, 255), cv2.FILLED)
        cv2.putText(img, button.text, (x + 20, y + 65),
                    cv2.FONT_HERSHEY_PLAIN, 4, (255, 255, 255), 4)
    return img
class Button():
    def __init__(self, pos, text, size=[85, 85]):
        self.pos = pos
        self.size = size
        self.text = text
 
 
buttonList = []
for i in range(len(keys)):
    for j, key in enumerate(keys[i]):
        buttonList.append(Button([100 * j + 50, 100 * i + 50], key))

def generate_frames(finalText):
    while True:
        success,img=cap.read()
        if not success:
            break
        else:
            img = detector.findHands(img)
            lmList, bboxInfo = detector.findPosition(img)
            img = drawAll(img, buttonList)
            
            if lmList:
                for button in buttonList:
                    x, y = button.pos
                    w, h = button.size
        
                    if x < lmList[8][0] < x + w and y < lmList[8][1] < y + h:
                        cv2.rectangle(img, (x - 5, y - 5), (x + w + 5, y + h + 5), (175, 0, 175), cv2.FILLED)
                        cv2.putText(img, button.text, (x + 20, y + 65),
                                    cv2.FONT_HERSHEY_PLAIN, 4, (255, 255, 255), 4)
                        l, _, _ = detector.findDistance(8, 12, img, draw=False)
                        # print(l)
        
                        ## when clicked
                        if l < 30:
                            keyboard.press(button.text)
                            cv2.rectangle(img, button.pos, (x + w, y + h), (0, 255, 0), cv2.FILLED)
                            cv2.putText(img, button.text, (x + 20, y + 65),
                                        cv2.FONT_HERSHEY_PLAIN, 4, (255, 255, 255), 4)
                            finalText += button.text
                            sleep(0.15)
        
            cv2.rectangle(img, (50, 350), (700, 450), (175, 0, 175), cv2.FILLED)
            cv2.putText(img, finalText, (60, 430),
                        cv2.FONT_HERSHEY_PLAIN, 5, (255, 255, 255), 5)
            
            cv2.waitKey(1)      
            
            
            ret,buffer=cv2.imencode('.jpg',img)
            img = buffer.tobytes()
        yield(b'--img\r\n'
                    b'Content-Type: image/jpeg\r\n\r\n' + img + 
                    b'\r\n')
            

def generate_frames1(qno):
    while True:
        success,img=cap.read()
        if not success:
            break
        else:
            img = cv2.flip(img,1)
            hands, img = detector1.findHands(img,flipType=False)
            if qno<qtotal:
                mcq=mcqlist[qno]
                img ,bbox= cvzone.putTextRect(img,mcq.question,[100,100],2,2,offset=50,border=5)#colorB
                img ,bbox1= cvzone.putTextRect(img,mcq.choice1,[100,250],2,2,offset=50,border=5)#colorB
                img ,bbox2= cvzone.putTextRect(img,mcq.choice2,[400,250],2,2,offset=50,border=5)#colorB
                img ,bbox3= cvzone.putTextRect(img,mcq.choice3,[100,400],2,2,offset=50,border=5)#colorB
                img ,bbox4= cvzone.putTextRect(img,mcq.choice4,[400,400],2,2,offset=50,border=5)#colorB

                if hands:
                    lmList = hands[0]['lmList']
                    cursor = lmList[8]
                    length,info=detector1.findDistance(lmList[8],lmList[12])
                    # print(length)
                    if length<30:
                        mcq.update(cursor,[bbox1,bbox2,bbox3,bbox4],img)
                        mcq.userAns 
                        if mcq.userAns is not None:
                            time.sleep(0.3)
                            qno +=1
            else:
                score=0
                for mcq in mcqlist:
                    if mcq.answer== mcq.userAns:
                        score +=1
                score=round((score/qtotal)*100,2)
                img , _ = cvzone.putTextRect(img,"Quiz Completed",[250,300],2,2,offset=50,border=5)
                img , _ = cvzone.putTextRect(img,f'Your Score:{score}%',[700,300],2,2,offset=50,border=5)

            #draw progress bar
            barValue = 150 + (950//qtotal)*qno
            cv2.rectangle(img,(150,600),(barValue,650),(0,255,0),cv2.FILLED)
            cv2.rectangle(img,(150,600),(1100,650),(255,0,255),5)
            img , _ = cvzone.putTextRect(img,f'{round((qno/qtotal)*100)}%',[1130,635],2,2,offset=16)
            ret,buffer=cv2.imencode('.jpg',img)
            img = buffer.tobytes()
            

        yield(b'--img\r\n'
                    b'Content-Type: image/jpeg\r\n\r\n' + img + 
                    b'\r\n')

def generate_frames2():
    while True:
        ret, frame = cap1.read()
        height, width, _ = frame.shape

        # Extract Region of interest
        roi = frame[:,:]
        # roi = frame[50: 720,50: 800]

        # 1. Object Detection
        mask = object_detector.apply(roi)
        _, mask = cv2.threshold(mask, 254, 255, cv2.THRESH_BINARY)
        contours, _ = cv2.findContours(mask, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        detections = []
        for cnt in contours:
            # Calculate area and remove small elements
            area = cv2.contourArea(cnt)
            if area > 100:
                #cv2.drawContours(roi, [cnt], -1, (0, 255, 0), 2)
                x, y, w, h = cv2.boundingRect(cnt)


                detections.append([x, y, w, h])

        # 2. Object Tracking
        boxes_ids = tracker.update(detections)
        for box_id in boxes_ids:
            x, y, w, h, id = box_id
            cv2.putText(roi, str(id), (x, y - 15), cv2.FONT_HERSHEY_PLAIN, 2, (255, 0, 0), 2)
            cv2.rectangle(roi, (x, y), (x + w, y + h), (0, 255, 0), 3)

        # cv2.imshow("roi", roi)
        # cv2.imshow("Frame", frame)
        # cv2.imshow("Mask", mask)

        key = cv2.waitKey(30)&0xFF
        if key == 27:
            break
        

    

        ret,buffer=cv2.imencode('.jpg',frame)
        frame = buffer.tobytes()
            

        yield(b'--frame\r\n'
                    b'Content-Type: image/jpeg\r\n\r\n' + frame + 
                    b'\r\n')
    cap1.release()
    cv2.destroyAllWindows()
            



@app.route('/')
def index():
    return render_template('index.html')


@app.route('/contact/')
def contact():
    return render_template('contact.html')



@app.route('/hand-detection/')
def hand():
    return render_template('hand-detection.html')

@app.route('/ic/')
def ic():
    return render_template('ic.html')

@app.route('/aiquiz/')
def aiquiz():
    return render_template('aiquiz.html')

@app.route('/video')
def video():
    return Response(generate_frames(finalText),mimetype='multipart/x-mixed-replace; boundary=img')

@app.route('/video1')
def video1():
    return Response(generate_frames1(qno),mimetype='multipart/x-mixed-replace; boundary=img')

@app.route('/video2')
def video2():
    return Response(generate_frames2(),mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == "__main__":
    app.run(debug=False,host='0.0.0.0')
