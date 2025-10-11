import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { JobseekerProfile } from "@/app/types/types";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
    fontSize: 12,
    color: "#1f2937",
    lineHeight: 1.5,
  },
  section: {
    marginBottom: 30,
  },
  header: {
    fontSize: 28,
    color: "#1f2937",
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 18,
    color: "#1f2937",
    borderBottomWidth: 2,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 6,
    marginBottom: 10,
  },
  orangeLine: {
    borderBottomWidth: 3,
    borderBottomColor: "#f97316",
    paddingBottom: 10,
    marginBottom: 20,
  },
  textGray: {
    color: "#6b7280",
  },
  textMuted: {
    color: "#4b5563",
  },
  tableRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  tableLabel: {
    width: 120,
    fontWeight: "bold",
    color: "#4b5563",
  },
  skillText: {
    fontSize: 12,
    lineHeight: 1.8,
  },
  expBlock: {
    borderLeftWidth: 3,
    borderLeftColor: "#f97316",
    paddingLeft: 10,
    marginBottom: 12,
  },
  eduBlock: {
    borderLeftWidth: 3,
    borderLeftColor: "#f97316",
    paddingLeft: 10,
    marginBottom: 12,
  },
  questionBlock: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  questionTitle: {
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 5,
  },
  questionAnswer: {
    fontSize: 11,
    color: "#4b5563",
    borderLeftWidth: 3,
    borderLeftColor: "#cbd5e1",
    paddingLeft: 8,
  },
});

export const CandidatePDF = ({
  profile,
  screeningQuestions,
  screeningAnswers,
}: {
  profile: JobseekerProfile;
  screeningQuestions?: { question: string }[] | undefined;
  screeningAnswers?: { answer: string }[] | undefined;
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.orangeLine}>
        <Text style={styles.header}>{profile.name || "Candidate Profile"}</Text>
      </View>

      {/* Basic Information */}
      {(profile.age || profile.visaStatus || profile.nationality) && (
        <View style={styles.section}>
          <Text style={styles.subHeader}>Basic Information</Text>
          {profile.age && (
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Age:</Text>
              <Text>{profile.age}</Text>
            </View>
          )}
          {profile.visaStatus && (
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Visa Status:</Text>
              <Text>{profile.visaStatus}</Text>
            </View>
          )}
          {profile.nationality && (
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Nationality:</Text>
              <Text>{profile.nationality}</Text>
            </View>
          )}
        </View>
      )}

      {/* Skills */}
      {profile.skills && (
        <View style={styles.section}>
          <Text style={styles.subHeader}>Skills</Text>
          <Text style={styles.skillText}>
            {profile.skills.split(",").join(" • ")}
          </Text>
        </View>
      )}

      {/* Work Experience */}
      {profile.workExperience && profile.workExperience.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.subHeader}>Work Experience</Text>
          {profile.workExperience.map((exp: any, idx: number) => (
            <View key={idx} style={styles.expBlock}>
              <Text style={{ fontWeight: "bold", fontSize: 14 }}>
                {exp.position || "Position"}
              </Text>
              <Text
                style={{
                  color: "#f97316",
                  fontWeight: "bold",
                  marginBottom: 3,
                }}
              >
                {exp.company || "Company"}
              </Text>
              {(exp.startDate || exp.endDate) && (
                <Text style={styles.textGray}>
                  {exp.startDate} {exp.endDate ? `- ${exp.endDate}` : ""}
                </Text>
              )}
              {exp.description && (
                <Text style={styles.textMuted}>{exp.description}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Education */}
      {profile.education && profile.education.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.subHeader}>Education</Text>
          {profile.education.map((edu: any, idx: number) => (
            <View key={idx} style={styles.eduBlock}>
              <Text style={{ fontWeight: "bold", fontSize: 14 }}>
                {edu.degree || "Degree"}
              </Text>
              <Text
                style={{
                  color: "#f97316",
                  fontWeight: "bold",
                  marginBottom: 3,
                }}
              >
                {edu.institution || "Institution"}
              </Text>
              {edu.fieldOfStudy && (
                <Text style={styles.textGray}>Field: {edu.fieldOfStudy}</Text>
              )}
              {(edu.startDate || edu.endDate) && (
                <Text style={styles.textGray}>
                  {edu.startDate} {edu.endDate ? `- ${edu.endDate}` : ""}
                </Text>
              )}
              {edu.description && (
                <Text style={styles.textMuted}>{edu.description}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Screening Questions */}
      {screeningQuestions && screeningQuestions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.subHeader}>Screening Questions</Text>
          {screeningQuestions.map((q, idx) => (
            <View key={idx} style={styles.questionBlock}>
              <Text style={styles.questionTitle}>
                Q{idx + 1}: {q.question}
              </Text>
              <Text style={styles.questionAnswer}>
                {screeningAnswers?.[idx]?.answer || "No answer provided"}
              </Text>
            </View>
          ))}
        </View>
      )}
    </Page>
  </Document>
);
