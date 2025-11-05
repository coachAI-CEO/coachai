import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11, lineHeight: 1.35 },
  h1: { fontSize: 22, marginBottom: 8 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 14 },
  chip: {
    borderWidth: 1, borderStyle: "solid", borderColor: "#bbb",
    borderRadius: 4, paddingVertical: 2, paddingHorizontal: 6,
    marginRight: 6, marginBottom: 6, fontSize: 9
  },
  h2: { fontSize: 14, marginTop: 14, marginBottom: 6 },
  h3Row: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginTop: 14 },
  h3: { fontSize: 12.5 },
  small: { fontSize: 10, color: "#666" },
  p: { marginBottom: 6 },
  list: { marginLeft: 12, marginBottom: 6 },
  li: { marginBottom: 3 },
  card: {
    borderWidth: 1, borderStyle: "solid", borderColor: "#ddd",
    borderRadius: 8, padding: 12, marginTop: 8
  },
  row: { flexDirection: "row", flexWrap: "wrap" },
  col: { flexGrow: 1, flexBasis: "45%" },
  hr: { borderBottomWidth: 1, borderStyle: "solid", borderBottomColor: "#eee", marginVertical: 10 },
  footer: {
    position: "absolute", bottom: 18, left: 32, right: 32, fontSize: 9,
    color: "#777", flexDirection: "row", justifyContent: "space-between"
  },
});

function BulletList({ items }: { items?: any[] }) {
  if (!Array.isArray(items) || !items.length) return null;
  return (
    <View style={styles.list}>
      {items.map((x, i) => <Text key={i} style={styles.li}>• {String(x)}</Text>)}
    </View>
  );
}

function Field({ label, value }: { label: string; value?: any }) {
  if (!value || (Array.isArray(value) && !value.length)) return null;
  const arr = Array.isArray(value) ? value : [value];
  return (
    <View style={{ marginBottom: 6 }}>
      <Text>{label}</Text>
      {arr.length === 1 && typeof arr[0] === "string"
        ? <Text style={styles.p}>{arr[0]}</Text>
        : <BulletList items={arr} />}
    </View>
  );
}

export function SessionExportPDF({ session }: { session: any }) {
  const { title, age, phase, zone, totalDurationMin, principleIds, psychThemeIds, summary, rationale, segments = [], id } = session || {};
  const drills = Array.isArray(segments) ? segments : [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>{title || "Session Export"}</Text>

        <View style={styles.metaRow}>
          {age ? <Text style={styles.chip}>{age}</Text> : null}
          {phase ? <Text style={styles.chip}>{phase}</Text> : null}
          {zone ? <Text style={styles.chip}>{zone}</Text> : null}
          {totalDurationMin ? <Text style={styles.chip}>{totalDurationMin} min</Text> : null}
        </View>

        <Field label="Rationale" value={rationale} />
        <Field label="Summary" value={summary} />
        <Field label="Principles" value={principleIds} />
        <Field label="Psych themes" value={psychThemeIds} />

        {drills.map((seg: any, i: number) => {
          const d = seg?.drill || {};
          const model = d?.modelInfluence || seg?.modelInfluence || {};
          return (
            <View key={i} wrap break={i > 0}>
              <View style={styles.h3Row}>
                <Text style={styles.h3}>{seg?.title || d?.title || `Segment ${i + 1}`}</Text>
                {seg?.durationMin ? <Text style={styles.small}>{seg.durationMin} min</Text> : null}
              </View>

              {d?.title && d?.title !== seg?.title ? (
                <Text style={{ marginTop: 2, marginBottom: 4, color: "#222" }}>
                  Drill: {d.title}
                </Text>
              ) : null}

              <View style={styles.card}>
                <Field label="Objective" value={d.objective} />
                <Field label="Setup" value={d.setup} />

                <View style={styles.row}>
                  <View style={styles.col}><Field label="Equipment" value={d.equipment} /></View>
                  <View style={styles.col}><Field label="Coaching points" value={d.coachingPoints} /></View>
                </View>

                <View style={styles.row}>
                  <View style={styles.col}><Field label="Technical focus" value={d.technicalFocus} /></View>
                  <View style={styles.col}><Field label="Psych focus" value={d.psychFocus} /></View>
                </View>

                <Field label="Organization" value={d.organization || seg?.organization} />
                <Field label="Progression" value={d.progression || seg?.progression} />

                {(model.principlesApplied || model.tacticalCues || model.constraintsToApply || model.coachingLanguage) ? (
                  <>
                    <View style={styles.hr} />
                    <Text>Model influence</Text>
                    <Field label="Model" value={model.modelName} />
                    <Field label="Principles applied" value={model.principlesApplied} />
                    <Field label="Tactical cues" value={model.tacticalCues} />
                    <Field label="Constraints" value={model.constraintsToApply} />
                    <Field label="Coaching language" value={model.coachingLanguage} />
                    <View style={styles.row}>
                      <View style={styles.col}><Field label="Unit focus" value={model.unitFocus} /></View>
                      <View style={styles.col}><Field label="Intensity profile" value={model.intensityProfile} /></View>
                    </View>
                    <Field label="Scoring bias" value={model.scoringBias} />
                  </>
                ) : null}
              </View>
            </View>
          );
        })}

        <View style={styles.footer} fixed>
          <Text>CoachAI • {title || "Session"}</Text>
          <Text>Session ID: {id || "-"}</Text>
        </View>
      </Page>
    </Document>
  );
}
