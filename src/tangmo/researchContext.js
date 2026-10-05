/**
 * Source-linked procedural context for the Tangmo research demo.
 * Checked 2026-10-02. A reported proceeding is not a final court finding.
 */

export const contextSources = [
  {
    id: 'pbs-early-timeline',
    title: 'ไทม์ไลน์ “แตงโม” สูญหาย 40 ชั่วโมง',
    publisher: 'Thai PBS',
    published: '2022-02-26',
    url: 'https://www.thaipbs.or.th/news/content/313093',
    kind: 'contemporaneous-report',
    note: 'ข่าวช่วงแรก รายงานเวลา 22:00 น. ด้วยถ้อยคำที่อาจอ่านเป็นเวลาออกเรือ และระบุพบร่างเวลา 13:10 น.',
  },
  {
    id: 'pbs-police-timeline',
    title: 'กางไทม์ไลน์ ก่อน-หลัง “แตงโม” ตกเรือ',
    publisher: 'Thai PBS',
    published: '2022-04-26',
    url: 'https://www.thaipbs.or.th/news/content/314905',
    kind: 'police-briefing-report',
    note: 'ถ่ายทอดลำดับเวลาและข้อสันนิษฐานที่ตำรวจภูธรภาค 1 แถลง โดยอ้าง GPS และ CCTV; บทความไม่เผยไฟล์ข้อมูลต้นฉบับ.',
  },
  {
    id: 'dsi-2025-clarification',
    title: 'DSI ชี้แจงการตรวจสอบข้อเท็จจริงคดีแตงโม',
    publisher: 'กรมสอบสวนคดีพิเศษ (DSI)',
    published: '2025-01-07',
    url: 'https://www.dsi.go.th/th/Detail/0643f076e657fb2c8f0a63bf10a29a5e',
    kind: 'official-statement',
    note: 'DSI ระบุว่าการรับอาสาสมัครเพื่อจำลองเหตุการณ์เป็นการดำเนินการของภาคประชาชน ขณะนั้นคณะทำงานยังตรวจสอบข้อเท็จจริง.',
  },
  {
    id: 'pbs-2025-judgment',
    title: 'ศาลฯ ยกฟ้อง 3 จำเลยคดีประมาท กรณีแตงโมเสียชีวิต',
    publisher: 'Thai PBS',
    published: '2025-05-23',
    url: 'https://www.thaipbs.or.th/news/content/352433',
    kind: 'court-report',
    note: 'รายงานผลคำพิพากษาศาลจังหวัดนนทบุรี ไม่ใช่เอกสารคำพิพากษาฉบับเต็ม.',
  },
  {
    id: 'fm91-2026-handoff',
    title: 'DSI ส่งสำนวนคดีแตงโมให้ ป.ป.ช. พิจารณา',
    publisher: 'สวพ.FM91',
    published: '2026-08-27',
    url: 'https://www.fm91bkk.com/newsarticle/77990',
    kind: 'proceeding-report',
    note: 'รายงานเหตุวันที่ 26 ส.ค. 2569: ส่งเอกสาร 54 แฟ้ม และถ่ายทอดข้อมูลจากชุดทำคดีว่า DSI ยุติเรื่องในส่วนของตนแล้ว.',
  },
  {
    id: 'pptv-2026-handoff',
    title: 'DSI ส่งสำนวนคดีแตงโม 54 แฟ้มให้ ป.ป.ช.',
    publisher: 'PPTV',
    published: '2026-08-26',
    url: 'https://www.pptvhd36.com/news/%E0%B8%AA%E0%B8%B1%E0%B8%87%E0%B8%84%E0%B8%A1/282253',
    kind: 'proceeding-report',
    note: 'รายงานการส่งสำนวนและคำชี้แจงของเจ้าหน้าที่ DSI พร้อมความเห็นที่ต่างกันของฝ่ายผู้ร้อง.',
  },
];

export const proceedings = [
  {
    date: '2025-01-07',
    title: 'DSI ชี้แจงขอบเขตการตรวจสอบ',
    description: 'DSI ระบุว่าคณะทำงานกำลังตรวจสอบข้อเท็จจริง และการจำลองเหตุการณ์โดยอาสาสมัครในเดือนมกราคมเป็นกิจกรรมของภาคประชาชน',
    sourceIds: ['dsi-2025-clarification'],
    caveat: 'คำชี้แจงนี้ระบุสถานะ ณ วันที่เผยแพร่ ไม่ใช่ผลสรุปคดี',
  },
  {
    date: '2025-05-23',
    title: 'ศาลจังหวัดนนทบุรีอ่านคำพิพากษา',
    description: 'ตามรายงาน Thai PBS ศาลยกฟ้องจำเลย 3 คนในข้อหาประมาทเป็นเหตุให้ผู้อื่นถึงแก่ความตาย และพิพากษาลงโทษอีกคนในข้อหาอื่นโดยรอการลงโทษ',
    sourceIds: ['pbs-2025-judgment'],
    caveat: 'อ้างอิงรายงานข่าว ไม่ใช่คำพิพากษาฉบับเต็ม; ไม่มีผลอุทธรณ์ที่ยืนยันจากศาลในชุดข้อมูลนี้',
  },
  {
    date: '2026-08-26',
    title: 'DSI ส่งเอกสารให้ ป.ป.ช.',
    description: 'สื่อสองแห่งรายงานว่า DSI ส่งสำนวน 54 แฟ้มให้ ป.ป.ช. พิจารณาตามขั้นตอน',
    sourceIds: ['fm91-2026-handoff', 'pptv-2026-handoff'],
    caveat: 'FM91 รายงานว่าชุดทำคดีระบุ DSI ยุติเรื่องในส่วนของตน ขณะที่ฝ่ายผู้ร้องให้ความหมายต่างกัน; ยังไม่พบผลพิจารณา ป.ป.ช. จากเอกสารทางการ',
  },
];

export const discrepancies = [
  {
    title: '22:00 น. ในข่าวช่วงแรก เทียบกับ 16:49 น. ในคำแถลงภายหลัง',
    description: 'ข่าว 26 ก.พ. เขียนเสมือนกลุ่มขึ้นเรือเวลา 22:00 น. แต่ไทม์ไลน์ GPS ที่ตำรวจแถลง 26 เม.ย. ระบุเรือออกจากอู่ตั้งแต่ 16:49 น. จึงไม่ควรใช้ 22:00 น. เป็นเวลาออกเรือที่ยืนยันแล้ว',
    sourceIds: ['pbs-early-timeline', 'pbs-police-timeline'],
  },
  {
    title: 'เวลาพบร่าง 13:00–13:10 น.',
    description: 'ข่าวช่วงแรกระบุ 13:10 น. ส่วนบทความแถลงตำรวจภายหลังระบุราว 13:00 น.; แสดงเป็นช่วงเวลาที่รายงานต่างกัน ไม่รวมให้กลายเป็นเวลาเดียว',
    sourceIds: ['pbs-early-timeline', 'pbs-police-timeline'],
  },
  {
    title: '22:34:10 น. เป็นข้อสันนิษฐานของตำรวจ',
    description: 'ตำรวจกล่าวว่าเงาวัตถุท้ายเรือหายจากภาพกล้องเวลา 22:34:10 น. และสันนิษฐานเป็นช่วงพลัดตก; ไม่มีไฟล์ CCTV ต้นฉบับในเดโมให้ยืนยันตัวบุคคลหรือวินาทีที่ตกได้เอง',
    sourceIds: ['pbs-police-timeline'],
  },
];
