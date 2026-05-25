import pptxgen from "pptxgenjs";

export async function buildPptxBuffer(presentation: {
  title: string;
  theme: string;
  colors: {
    bg: string;
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    heading: string;
    muted: string;
  };
  fontTitle: string;
  fontBody: string;
  hideFooter?: boolean;
  slideData: Array<{
    id: string;
    type: 'title' | 'content' | 'agenda' | 'conclusion' | 'section' | 'two-column' | 'stat' | 'quote' | 'timeline';
    title: string;
    subtitle?: string;
    bullets: string[];
    image?: string;
    svg?: string;
    align?: 'left' | 'center' | 'right';
    layoutStyle?: 'default' | 'card' | 'split' | 'minimal';
    cardColor?: string;
    imageCount?: number;
    images?: string[];
  }>;
}): Promise<Buffer> {
  let PptxGenJS = pptxgen;
  if (typeof PptxGenJS === 'object' && (PptxGenJS as any).default) {
    PptxGenJS = (PptxGenJS as any).default;
  }
  const pptx = new (PptxGenJS as any)();
  
  // Set dimensions to standard 16:9 widescreen
  pptx.layout = 'LAYOUT_16x9';

  const { colors, fontTitle, fontBody, title } = presentation;

  presentation.slideData.forEach((slide, idx) => {
    const pptSlide = pptx.addSlide();
    
    // Apply background color
    const bgColor = colors.bg || "#ffffff";
    pptSlide.background = { fill: bgColor };

    // Format theme colors correctly (ensure it has no hash sometimes or has standard string hex)
    const primaryHex = colors.primary.replace('#', '');
    const secondaryHex = colors.secondary.replace('#', '');
    const accentHex = colors.accent.replace('#', '');
    const textHex = colors.text.replace('#', '');
    const mutedHex = colors.muted.replace('#', '');

    const align = slide.align || 'left';
    const layoutStyle = slide.layoutStyle || 'default';

    // ----------------------------------------------------
    // STRUCTURAL LAYOUT BACKGROUND FRAMES
    // ----------------------------------------------------

    // 1. DYNAMIC CARD BOX Frame Style
    if (layoutStyle === 'card') {
      const cardBgColor = (slide.cardColor || 'FAFAFB').replace('#', '');
      pptSlide.addShape("rect", {
        x: 0.6,
        y: 0.5,
        w: 12.13,
        h: 6.3,
        fill: { color: cardBgColor },
        line: { color: accentHex + "25", width: 1.5 }
      });
    }

    // 2. EXECUTIVE SPLIT-SCREEN Frame Style
    if (layoutStyle === 'split') {
      // High-contrast primary sidebar filling left 33%
      pptSlide.addShape("rect", {
        x: 0,
        y: 0,
        w: 4.4,
        h: 7.5,
        fill: { color: primaryHex + "08" },
        line: { color: accentHex + "15", width: 1 }
      });
    }

    // ----------------------------------------------------
    // LAYOUT RENDERING PIPELINE
    // ----------------------------------------------------

    if (slide.type === 'title') {
      // A. Title presentation layout
      if (layoutStyle !== 'minimal') {
        pptSlide.addShape("rect", {
          x: 0,
          y: 0,
          w: "5%",
          h: "100%",
          fill: { color: primaryHex }
        });
      }

      // Title header
      const titleAlign = align === 'center' ? 'center' : align === 'right' ? 'right' : 'left';
      pptSlide.addText(title || slide.title, {
        x: align === 'center' ? 1.0 : align === 'right' ? 2.0 : 1.2,
        y: 2.1,
        w: align === 'center' ? 11.3 : 10.5,
        h: 1.8,
        fontSize: 38,
        fontFace: fontTitle || "Arial",
        color: primaryHex,
        bold: true,
        align: titleAlign,
        valign: 'middle'
      });

      // Subtitle presentation subtitle
      if (slide.subtitle || slide.title) {
        const sub = slide.subtitle || slide.title;
        pptSlide.addText(sub, {
          x: align === 'center' ? 1.0 : align === 'right' ? 2.0 : 1.2,
          y: 4.0,
          w: align === 'center' ? 11.3 : 10.5,
          h: 0.7,
          fontSize: 18,
          fontFace: fontBody || "Arial",
          color: secondaryHex,
          align: titleAlign
        });
      }

    } else if (slide.type === 'section') {
      // B. Section divider Separation layout
      pptSlide.addShape("rect", {
        x: 0,
        y: 2.4,
        w: "100%",
        h: 2.7,
        fill: { color: primaryHex }
      });

      const secAlign = align === 'center' ? 'center' : align === 'right' ? 'right' : 'left';
      pptSlide.addText(slide.title, {
        x: 1.0,
        y: 2.6,
        w: 11.3,
        h: 1.2,
        fontSize: 32,
        fontFace: fontTitle || "Arial",
        color: 'FFFFFF', // White text inside section background banner
        bold: true,
        align: secAlign,
        valign: 'middle'
      });

      if (slide.subtitle) {
        pptSlide.addText(slide.subtitle, {
          x: 1.0,
          y: 3.9,
          w: 11.3,
          h: 0.6,
          fontSize: 15,
          fontFace: fontBody || "Arial",
          color: 'E2E8F0',
          align: secAlign
        });
      }

    } else if (slide.type === 'two-column') {
      // C. Two-Column Comparison Layout
      // Title
      pptSlide.addText(slide.title, {
        x: 0.8,
        y: 0.6,
        w: 11.5,
        h: 0.8,
        fontSize: 26,
        fontFace: fontTitle || "Arial",
        color: primaryHex,
        bold: true,
        align: align,
        valign: 'middle'
      });

      if (layoutStyle !== 'minimal') {
        pptSlide.addShape("rect", {
          x: align === 'center' ? 6.06 : align === 'right' ? 11.1 : 0.8,
          y: 1.4,
          w: 1.2,
          h: 0.04,
          fill: { color: accentHex }
        });
      }

      // Columns logic
      const midPoint = Math.max(1, Math.ceil((slide.bullets || []).length / 2));
      const leftColBullets = (slide.bullets || []).slice(0, midPoint);
      const rightColBullets = (slide.bullets || []).slice(midPoint);

      // Left Column Text
      const leftBulletsFormatted = leftColBullets.map(bulletText => ({
        text: bulletText,
        options: { fontSize: 13, color: textHex, fontFace: fontBody || "Arial", bullet: true, breakLine: true }
      }));

      pptSlide.addText([{ text: "Section Focus A\n", options: { fontSize: 11, bold: true, color: secondaryHex, fontFace: fontBody || "Arial", breakLine: true } }, ...leftBulletsFormatted], {
        x: 0.8,
        y: 1.8,
        w: 5.5,
        h: 4.5,
        align: align,
        valign: 'top',
        lineSpacing: 24
      });

      // Right Column Text
      const rightBulletsFormatted = rightColBullets.map(bulletText => ({
        text: bulletText,
        options: { fontSize: 13, color: textHex, fontFace: fontBody || "Arial", bullet: true, breakLine: true }
      }));

      pptSlide.addText([{ text: "Section Focus B\n", options: { fontSize: 11, bold: true, color: secondaryHex, fontFace: fontBody || "Arial", breakLine: true } }, ...rightBulletsFormatted], {
        x: 6.8,
        y: 1.8,
        w: 5.7,
        h: 4.5,
        align: align,
        valign: 'top',
        lineSpacing: 24
      });

    } else if (slide.type === 'stat') {
      // D. Spotlight Stat Callout Layout
      pptSlide.addText(slide.title, {
        x: 0.8,
        y: 0.6,
        w: 11.5,
        h: 0.8,
        fontSize: 26,
        fontFace: fontTitle || "Arial",
        color: primaryHex,
        bold: true,
        align: align,
        valign: 'middle'
      });

      const statNumber = slide.bullets[0] || '10x';
      const detailBullets = slide.bullets.slice(1);

      // Huge spotlight statistical stat
      pptSlide.addText([
        { text: statNumber + "\n", options: { fontSize: 58, bold: true, color: primaryHex, fontFace: fontTitle || "Arial" } },
        { text: "KEY METRIC FOCUS", options: { fontSize: 10, bold: true, color: accentHex, fontFace: fontBody || "Arial" } }
      ], {
        x: 0.8,
        y: 1.8,
        w: 4.2,
        h: 4.5,
        align: 'center',
        valign: 'middle'
      });

      // Supporting takeaway lists
      const detailsFormatted = detailBullets.map(bulletText => ({
        text: bulletText,
        options: { fontSize: 13, color: textHex, fontFace: fontBody || "Arial", bullet: true, breakLine: true }
      }));

      pptSlide.addText(detailsFormatted, {
        x: 5.5,
        y: 1.8,
        w: 7.0,
        h: 4.5,
        align: align,
        valign: 'top',
        lineSpacing: 25
      });

    } else if (slide.type === 'quote') {
      // E. Central Testimonial / Quote Layout
      const quoteText = slide.bullets[0] || 'Incredible vision and delivery.';
      const citationText = slide.bullets[1] || '';

      // Large Quotes shape icon
      pptSlide.addText("“", {
        x: 1.5,
        y: 1.3,
        w: 10.3,
        h: 0.8,
        fontSize: 48,
        color: accentHex,
        fontFace: fontTitle || "Georgia",
        align: 'center',
        italic: true
      });

      // Centered testimonial bullet text
      pptSlide.addText(quoteText, {
        x: 1.5,
        y: 2.1,
        w: 10.3,
        h: 3.0,
        fontSize: 18,
        color: primaryHex,
        fontFace: fontTitle || "Arial",
        align: 'center',
        valign: 'middle',
        italic: true,
        lineSpacing: 26
      });

      if (citationText) {
        pptSlide.addText(`— ${citationText}`, {
          x: 1.5,
          y: 5.1,
          w: 10.3,
          h: 0.6,
          fontSize: 12,
          bold: true,
          color: accentHex,
          fontFace: fontBody || "Arial",
          align: 'center'
        });
      }

    } else if (slide.type === 'timeline') {
      // F. Horizontal Workflow Timeline Layout
      pptSlide.addText(slide.title, {
        x: 0.8,
        y: 0.6,
        w: 11.5,
        h: 0.8,
        fontSize: 26,
        fontFace: fontTitle || "Arial",
        color: primaryHex,
        bold: true,
        align: align,
        valign: 'middle'
      });

      const phase1 = slide.bullets[0] || '';
      const phase2 = slide.bullets[1] || '';
      const phase3 = slide.bullets[2] || '';

      const phases = [phase1, phase2, phase3];

      phases.forEach((phaseVal, pIdx) => {
        const xOffset = 0.8 + (pIdx * 4.0);
        
        // Step box container
        pptSlide.addShape("rect", {
          x: xOffset,
          y: 1.8,
          w: 3.7,
          h: 4.2,
          fill: { color: "FAFAFC" },
          line: { color: accentHex + "20", width: 1.5 }
        });

        // Phase header text
        pptSlide.addText(`PHASE 0${pIdx + 1}`, {
          x: xOffset + 0.2,
          y: 2.0,
          w: 3.3,
          h: 0.4,
          fontSize: 10,
          bold: true,
          color: accentHex,
          fontFace: fontBody || "Arial"
        });

        // Phase description text
        pptSlide.addText(phaseVal, {
          x: xOffset + 0.2,
          y: 2.5,
          w: 3.3,
          h: 3.3,
          fontSize: 12,
          color: textHex,
          fontFace: fontBody || "Arial",
          valign: 'top',
          lineSpacing: 22
        });
      });

    } else {
      // G. Content, agenda, and conclusion bullets points list layout
      
      // Slide Title
      pptSlide.addText(slide.title, {
        x: 0.8,
        y: 0.6,
        w: 11.5,
        h: 0.8,
        fontSize: 26,
        fontFace: fontTitle || "Arial",
        color: primaryHex,
        bold: true,
        align: align,
        valign: 'middle'
      });

      // Decorative mini underline
      if (layoutStyle !== 'minimal') {
        const underlineX = align === 'center' ? 6.06 : align === 'right' ? 11.1 : 0.8;
        pptSlide.addShape("rect", {
          x: underlineX,
          y: 1.4,
          w: 1.2,
          h: 0.04,
          fill: { color: accentHex }
        });
      }

      // Content coordinate offset (no subtitle is displayed here as requested by user)
      let contentY = 1.6;

      // Bullet content rendering
      const uploadImages = slide.images || [];
      const imageCountSetting = slide.imageCount !== undefined ? slide.imageCount : (uploadImages.length > 0 ? uploadImages.length : (slide.image ? 1 : 0));
      const hasVisual = imageCountSetting > 0 || !!slide.svg;
      const textBoxWidth = hasVisual ? 6.2 : 11.7;

      if (slide.bullets && slide.bullets.length > 0) {
        const bulletData = slide.bullets.map(bulletText => {
          return {
            text: bulletText,
            options: {
              fontSize: 14,
              color: textHex,
              fontFace: fontBody || "Arial",
              bullet: true,
              indentLevel: 0,
              breakLine: true
            }
          };
        });

        pptSlide.addText(bulletData, {
          x: 0.8,
          y: contentY,
          w: textBoxWidth,
          h: 4.8,
          align: align,
          valign: 'top',
          lineSpacing: 25,
          margin: 0
        });
      }

      // Render image visual assets depending on layout setting
      if (imageCountSetting === 1) {
        const imgPath = uploadImages[0] || slide.image;
        if (imgPath) {
          try {
            const rawBase64 = imgPath.includes(",") ? imgPath.split(",")[1] : imgPath;
            pptSlide.addImage({
              data: "base64:" + rawBase64,
              x: 7.2,
              y: 1.5,
              w: 5.2,
              h: 4.5
            });
          } catch (imgErr) {
            console.error("Failed to inject image 1 into PPT slide:", imgErr);
          }
        }
      } else if (imageCountSetting === 2) {
        const img1 = uploadImages[0];
        const img2 = uploadImages[1];
        
        if (img1) {
          try {
            const rawBase64 = img1.includes(",") ? img1.split(",")[1] : img1;
            pptSlide.addImage({
              data: "base64:" + rawBase64,
              x: 7.2,
              y: 1.5,
              w: 5.2,
              h: 2.1
            });
          } catch (imgErr) {
            console.error("Failed to inject grid image 1:", imgErr);
          }
        }
        if (img2) {
          try {
            const rawBase64 = img2.includes(",") ? img2.split(",")[1] : img2;
            pptSlide.addImage({
              data: "base64:" + rawBase64,
              x: 7.2,
              y: 3.8,
              w: 5.2,
              h: 2.1
            });
          } catch (imgErr) {
            console.error("Failed to inject grid image 2:", imgErr);
          }
        }
      } else if (slide.svg) {
        // Draw a neat aesthetic container indicating SVG Illustration
        pptSlide.addShape("rect", {
          x: 7.2,
          y: 1.5,
          w: 5.2,
          h: 4.5,
          fill: { color: accentHex + "15" },
          line: { color: accentHex, width: 1 }
        });
        pptSlide.addText("Custom Vector Slide Graphic", {
          x: 7.3,
          y: 3.4,
          w: 5.0,
          h: 0.6,
          fontSize: 14,
          fontFace: fontTitle || "Arial",
          color: primaryHex,
          align: 'center',
          bold: true
        });
      }
    }

    // Add a unified modern footer (respect hideFooter option)
    if (presentation.hideFooter !== true) {
      pptSlide.addText(`Slide ${idx + 1} of ${presentation.slideData.length}`, {
        x: 0.8,
        y: 6.9,
        w: 11.7,
        h: 0.3,
        fontSize: 9,
        fontFace: fontBody || "Arial",
        color: mutedHex,
        align: 'right'
      });
    }
  });

  const bufferOutput = await pptx.write({ outputType: 'nodebuffer' });
  return bufferOutput as Buffer;
}
