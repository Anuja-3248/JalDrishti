import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            super().showPage()
        super().save()

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#64748b"))
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(612 - 54, 36, page_str)
        self.drawString(54, 36, "JalDrishti — Frontend Design & Implementation Guide (For Bhavika)")
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(54, 48, 612 - 54, 48)
        self.restoreState()

def create_pdf(filename="JalDrishti_Frontend_Plan_For_Bhavika.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=64
    )

    styles = getSampleStyleSheet()

    # Custom palette
    navy_dark = colors.HexColor("#0f172a")
    blue_primary = colors.HexColor("#0284c7")
    slate_sub = colors.HexColor("#475569")
    slate_bg = colors.HexColor("#f8fafc")
    border_color = colors.HexColor("#cbd5e1")
    accent_green = colors.HexColor("#16a34a")
    accent_red = colors.HexColor("#dc2626")

    # Typography styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=navy_dark,
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=slate_sub,
        spaceAfter=14
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=navy_dark,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=blue_primary,
        spaceBefore=10,
        spaceAfter=5,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14.5,
        textColor=colors.HexColor("#1e293b"),
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=body_style,
        leftIndent=15,
        bulletIndent=5,
        spaceAfter=4
    )

    callout_style = ParagraphStyle(
        'Callout_Text',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor("#0f172a")
    )

    code_style = ParagraphStyle(
        'Code_Snippet',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor("#0f172a")
    )

    story = []

    # Document Header
    story.append(Paragraph("JalDrishti — Frontend Plan", title_style))
    story.append(Paragraph("Clean, Human-Designed UI & Smooth Animations Guide | <b>For Bhavika</b>", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=blue_primary, spaceBefore=0, spaceAfter=14))

    # SECTION 1: THE CORE PHILOSOPHY
    story.append(Paragraph("1. The Core Design Vision: 'Human, Clean & Impressive'", h1_style))
    story.append(Paragraph(
        "Our goal is to make the dashboard look like a <b>real, modern, world-class product</b> (inspired by studios like <i>Cuberto</i>, <i>Linear</i>, and <i>Stripe</i>) — <b>NOT</b> an over-cluttered, neon 'AI-generated' demo.",
        body_style
    ))
    
    philosophy_data = [
        [
            Paragraph("<b>What We AVOID (Looks AI-generated):</b>", body_style),
            Paragraph("<b>What We BUILD (Cuberto / Human Feel):</b>", body_style)
        ],
        [
            Paragraph("• No harsh neon rainbow glows everywhere.<br/>• No fake sci-fi buzzwords or busy charts.<br/>• No jarring, instant color changes.<br/>• No cramped, unreadable fonts.", body_style),
            Paragraph("• Clean dark slate background (#0a0f1d / #0f172a).<br/>• Smooth micro-interactions & buttery easing.<br/>• Crisp, readable cards with gentle borders.<br/>• Calm, confident, and intuitive hierarchy.", body_style)
        ]
    ]
    t_phil = Table(philosophy_data, colWidths=[245, 255])
    t_phil.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor("#fff1f2")),
        ('BACKGROUND', (1,0), (1,-1), colors.HexColor("#f0fdf4")),
        ('BOX', (0,0), (-1,-1), 0.5, border_color),
        ('INNERGRID', (0,0), (-1,-1), 0.5, border_color),
        ('TOPPADDING', (0,0), (-1,-1), 7),
        ('BOTTOMPADDING', (0,0), (-1,-1), 7),
        ('LEFTPADDING', (0,0), (-1,-1), 9),
        ('RIGHTPADDING', (0,0), (-1,-1), 9),
    ]))
    story.append(t_phil)
    story.append(Spacer(1, 12))

    # SECTION 2: ANIMATION LIBRARIES & INSPIRATION
    story.append(Paragraph("2. Animation Tools & Inspiration (The 'Cuberto' Vibe)", h1_style))
    story.append(Paragraph(
        "Instead of heavy libraries, use lightweight, standard tools that give maximum elegance with minimum code:",
        body_style
    ))
    story.append(Paragraph("• <b>Framer Motion:</b> For smooth card enters, tab transitions, and animated number tickers.", bullet_style))
    story.append(Paragraph("• <b>Smooth Cubic-Bezier Easing:</b> Use <code>cubic-bezier(0.16, 1, 0.3, 1)</code> for all hover effects. It feels organic and springy, exactly like high-end agency designs.", bullet_style))
    story.append(Paragraph("• <b>Lucide React Icons:</b> Crisp, clean, minimalist SVG icons (no heavy blurry icon packs).", bullet_style))
    story.append(Paragraph("• <b>Leaflet Animated Trajectories:</b> Smooth dotted marching lines showing ship tracks moving toward the origin.", bullet_style))
    story.append(Spacer(1, 10))

    # SECTION 3: STEP-BY-STEP BUILD CHECKLIST FOR BHAVIKA
    story.append(Paragraph("3. Step-by-Step Tasks for Tomorrow (Straightforward Checklist)", h1_style))
    
    tasks = [
        ("Step 1: Top Bar & Region Badge", 
         "Keep it clean and uncluttered. Show the Incident ID in a subtle mono font tag, a green pulsing dot for 'Live Ingestion Online', and a clean 'Run Investigation' button with a subtle hover lift."),
        
        ("Step 2: 4-Stage Stepper (Clean Sequential Flow)", 
         "Instead of all 9 steps flashing at once, make the active step have a soft blue pill indicator. When 'Run Pipeline' is clicked, steps transition with a smooth 0.3s delay."),
        
        ("Step 3: Central Leaflet Map Elevation", 
         "• Use CartoDB Dark Matter tiles (already looks clean).<br/>• Make the oil slick polygon have a subtle semi-transparent ocean gradient.<br/>• Add a gentle radar ring ping on the origin zone.<br/>• Highlight the culprit vessel track in amber/red with an animated flowing dash."),
        
        ("Step 4: The Showstopper — Top 3 Culprits Card", 
         "This is where anyone opening the site gets impressed:<br/>• <b>Card #1 (Highest Culprit):</b> Featured at top with an 87% Match badge, Vessel Name (MT AZURE HORIZON), ship type, and 3 clear forensic evidence bullet points.<br/>• <b>Cards #2 & #3:</b> Smaller, calm secondary cards (12% and 6%) showing why they were cleared.<br/>• <b>Hover effect:</b> Hovering any ship card highlights that ship's path on the map."),
        
        ("Step 5: Satellite Properties Inspector (Simple & Clear)", 
         "A clean 2-column key-value grid: Centroid (Lat/Lon), Slick Area (18.4 km²), Perimeter, and Confidence (91%). Clean numbers, no unnecessary charts."),
        
        ("Step 6: Timeline Scrubber (Drift Animation)", 
         "When moving the slider from 0h to 48h, the slick polygon smoothly transitions and expands along the ocean drift vector.")
    ]

    for title, desc in tasks:
        task_table = Table([
            [Paragraph(f"<b>{title}</b>", h2_style)],
            [Paragraph(desc, body_style)]
        ], colWidths=[504])
        task_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), slate_bg),
            ('BOX', (0,0), (-1,-1), 0.5, border_color),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('LEFTPADDING', (0,0), (-1,-1), 10),
            ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ]))
        story.append(task_table)
        story.append(Spacer(1, 6))

    story.append(Spacer(1, 6))

    # SECTION 4: READY-TO-USE CODE SNIPPETS
    story.append(Paragraph("4. Copy-Paste Code Helpers for Bhavika", h1_style))
    story.append(Paragraph("Add this smooth easing curve to <code>tailwind.config.js</code> or <code>index.css</code> for instant Cuberto-style feel:", body_style))

    css_code = """/* Add to index.css for smooth human-like interactions */
.cuberto-card {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1),
              border-color 0.3s ease;
}
.cuberto-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px -10px rgba(2, 132, 199, 0.15);
  border-color: rgba(2, 132, 199, 0.4);
}"""

    t_code = Table([[Paragraph(css_code.replace('\n', '<br/>').replace(' ', '&nbsp;'), code_style)]], colWidths=[504])
    t_code.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#0f172a")),
        ('BOX', (0,0), (-1,-1), 0.5, border_color),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
    ]))
    story.append(t_code)
    story.append(Spacer(1, 10))

    # FOOTER CALLOUT
    final_note = [
        [Paragraph("<b>Summary for Tomorrow:</b> Build step-by-step, test the Top 3 Culprits card first, keep colors balanced (dark slate + ocean blue), and focus on smooth hover transitions. That alone will look extremely premium!", callout_style)]
    ]
    t_note = Table(final_note, colWidths=[504])
    t_note.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#e0f2fe")),
        ('BOX', (0,0), (-1,-1), 1, blue_primary),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
    ]))
    story.append(t_note)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully created: {filename}")

if __name__ == "__main__":
    out_path = os.path.join(os.getcwd(), "JalDrishti_Frontend_Plan_For_Bhavika.pdf")
    create_pdf(out_path)
