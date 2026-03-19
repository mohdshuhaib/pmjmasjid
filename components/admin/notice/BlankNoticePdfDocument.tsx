"use client";

import React from "react";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { BlankNoticeDesignState } from "./types";
import { confirmedByMalayalamMap, FONT_FAMILY, marginPresetMap, weightMap } from "./constants";
import { formatDisplayDate } from "./utils";

function getPdfStyles(state: BlankNoticeDesignState) {
  const margin = marginPresetMap[state.marginPreset];

  return StyleSheet.create({
    page: {
      fontFamily: FONT_FAMILY,
      paddingTop: margin,
      paddingBottom: margin,
      paddingHorizontal: margin,
      backgroundColor: "#FFFFFF",
      color: "#111827",
    },
    contentWrap: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
    },
    heading: {
      fontSize: state.typography.heading.size,
      fontWeight: weightMap[state.typography.heading.weight],
      textAlign: state.typography.heading.align,
      lineHeight: 1.35,
      marginBottom: 26,
    },
    details: {
      fontSize: state.typography.details.size,
      fontWeight: weightMap[state.typography.details.weight],
      textAlign: state.typography.details.align,
      lineHeight: 1.7,
    },
    footerMeta: {
      marginTop: "auto",
      paddingTop: 32,
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
    },
    date: {
      fontSize: state.typography.meta.size,
      fontWeight: weightMap[state.typography.meta.weight],
      textAlign: "left",
    },
    confirmedBy: {
      fontSize: state.typography.confirmedBy.size,
      fontWeight: weightMap[state.typography.confirmedBy.weight],
      textAlign: "right",
    },
  });
}

export default function BlankNoticePdfDocument({ state }: { state: BlankNoticeDesignState }) {
  const styles = getPdfStyles(state);

  return (
    <Document title={state.heading || "Blank Notice"} author="Perunguzhi Muslim Jama'ath">
      <Page size={state.pageSize} orientation={state.orientation} style={styles.page} wrap>
        <View style={styles.contentWrap}>
          <Text style={styles.heading}>{state.heading || " "}</Text>
          <Text style={styles.details}>{state.details || " "}</Text>

          <View style={styles.footerMeta} fixed>
            <Text style={styles.date}>{formatDisplayDate(state.noticeDate)}</Text>
            <Text style={styles.confirmedBy}>{confirmedByMalayalamMap[state.confirmedBy]}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}