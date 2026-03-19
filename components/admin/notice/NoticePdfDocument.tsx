"use client";

import React from "react";
import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { NoticeDesignState, CommitteeContacts } from "./types";
import { buildReferenceCode, formatDisplayDate } from "./utils";
import { confirmedByMalayalamMap, FONT_FAMILY, LOGO_URL, marginPresetMap, weightMap } from "./constants";

function getPdfStyles(state: NoticeDesignState) {
  const margin = marginPresetMap[state.marginPreset];
  const headingTypography = state.typography.heading;
  const detailsTypography = state.typography.details;
  const metaTypography = state.typography.meta;
  const confirmedTypography = state.typography.confirmedBy;

  return StyleSheet.create({
    page: {
      fontFamily: FONT_FAMILY,
      paddingTop: margin,
      paddingBottom: margin - 2,
      paddingHorizontal: margin,
      color: "#111827",
      fontSize: 12,
      lineHeight: 1.45,
      backgroundColor: "#FFFFFF",
    },
    topBlock: { marginBottom: 10 },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 12,
    },
    headerSide: { width: "34%", gap: 2 },
    headerCenter: {
      width: "24%",
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 2,
    },
    headerEnglishTop: { fontSize: 13, fontWeight: 700, color: "#065f46" },
    headerEnglishMid: { fontSize: 11, fontWeight: 500 },
    headerEnglishBottom: { fontSize: 11, fontWeight: 500 },
    headerMalayalamTop: { fontSize: 12, fontWeight: 700, textAlign: "right", color: "#065f46" },
    headerMalayalamMid: { fontSize: 10, fontWeight: 500, textAlign: "right" },
    headerMalayalamBottom: { fontSize: 11, fontWeight: 500, textAlign: "right" },
    logo: { width: 50, height: 50, objectFit: "contain" },
    regText: { fontSize: 8.5, textAlign: "center", fontWeight: 500 },
    separatorWrap: { marginTop: 8, marginBottom: 10, gap: 2 },
    separatorLine1: { borderTopWidth: 1, borderTopColor: "#b91c1c" },
    separatorLine2: { borderTopWidth: 0.6, borderTopColor: "#fca5a5" },
    metaRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 22,
      fontSize: metaTypography.size,
      fontWeight: weightMap[metaTypography.weight],
    },
    heading: {
      fontSize: headingTypography.size,
      fontWeight: weightMap[headingTypography.weight],
      textAlign: headingTypography.align,
      marginBottom: 18,
      lineHeight: 1.35,
    },
    bodyText: {
      fontSize: detailsTypography.size,
      fontWeight: weightMap[detailsTypography.weight],
      textAlign: detailsTypography.align,
      lineHeight: 1.65,
      marginBottom: 28,
    },
    confirmedWrap: {
      alignItems: "flex-end",
      marginTop: 12,
      marginBottom: 20,
    },
    confirmedLabel: {
      fontSize: confirmedTypography.size,
      fontWeight: weightMap[confirmedTypography.weight],
      textAlign: confirmedTypography.align,
    },
    footerPush: { flexGrow: 1 },
    footerWrap: { marginTop: "auto", paddingTop: 6 },
    footerTop: {
      fontSize: state.pageSize === "A3" ? 14 : 10,
      fontWeight: 600,
      textAlign: "center",
      color: "#065f46",
      marginTop: 5,
    },
    footerBottom: {
      fontSize: state.pageSize === "A3" ? 13 : 10,
      textAlign: "center",
      marginTop: 0,
      color: "#374151",
    },
  });
}

export default function NoticePdfDocument({ state, contacts }: { state: NoticeDesignState; contacts: CommitteeContacts }) {
  const styles = getPdfStyles(state);

  return (
    <Document title={state.heading || "Notice"} author="Perunguzhi Muslim Jama'ath">
      <Page size={state.pageSize} orientation={state.orientation} style={styles.page} wrap>
        <View style={styles.topBlock}>
          <View style={styles.headerRow}>
            <View style={styles.headerSide}>
              <Text style={styles.headerEnglishTop}>Perunguzhi Muslim Jama&apos;ath</Text>
              <Text style={styles.headerEnglishMid}>Perunguzhi P.O, Thiruvananthapuram</Text>
              <Text style={styles.headerEnglishBottom}>PIN: 695305, Since: 1995</Text>
            </View>

            <View style={styles.headerCenter}>
              <Image src={LOGO_URL} style={styles.logo} />
              <Text style={styles.regText}>Reg. No. 5753/RA</Text>
            </View>

            <View style={styles.headerSide}>
              <Text style={styles.headerMalayalamTop}>പെരുങ്ങുഴി മുസ്ലിം ജമാഅത്ത്</Text>
              <Text style={styles.headerMalayalamMid}>പെരുങ്ങുഴി പി.ഒ, തിരുവനന്തപുരം</Text>
              <Text style={styles.headerMalayalamBottom}>പിൻ: 695305, 1995 മുതൽ</Text>
            </View>
          </View>

          <View style={styles.separatorWrap}>
            <View style={styles.separatorLine1} />
            <View style={styles.separatorLine2} />
          </View>
        </View>

        <View style={styles.metaRow}>
          <Text>Ref.: {buildReferenceCode(state.refNumber)}</Text>
          <Text>Date: {formatDisplayDate(state.noticeDate)}</Text>
        </View>

        <Text style={styles.heading}>{state.heading || " "}</Text>
        <Text style={styles.bodyText}>{state.details || " "}</Text>

        <View style={styles.confirmedWrap}>
          <Text style={styles.confirmedLabel}>{confirmedByMalayalamMap[state.confirmedBy]}</Text>
        </View>

        <View style={styles.footerPush} />

        <View style={styles.footerWrap} fixed>
          <View style={styles.separatorWrap}>
            <View style={styles.separatorLine1} />
            <View style={styles.separatorLine2} />
          </View>
          <Text style={styles.footerTop}>
            Perunguzhi Muslim Jama&apos;ath, Perunguzhi, Perunguzhi P.O, Azhoor VIA, 695305,
            Thiruvananthapuram, Kerala, India
          </Text>
          <Text style={styles.footerBottom}>
            President: {contacts.president}, Secretary: {contacts.secretary}, Email: techpmj@gmail.com,
            Website: pmjmasjid.vercel.app
          </Text>
        </View>
      </Page>
    </Document>
  );
}