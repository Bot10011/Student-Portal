import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { gradeService } from '../lib/services/gradeService';
import { GradeSummary, GradeExportOptions } from '../types/grades';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormGroup
} from '@mui/material';
import { toast } from 'react-hot-toast';
import DownloadIcon from '@mui/icons-material/Download';

export const RegistrarGradeViewer: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [grades, setGrades] = useState<GradeSummary[]>([]);
  const [academicYear, setAcademicYear] = useState<string>('');
  const [semester, setSemester] = useState<string>('');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [availableSemesters, setAvailableSemesters] = useState<string[]>([]);
  const [availableTeachers, setAvailableTeachers] = useState<Array<{ id: string; name: string }>>([]);
  const [availableSubjects, setAvailableSubjects] = useState<Array<{ id: string; code: string; name: string }>>([]);

  // Export dialog state
  const [exportDialog, setExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [includeRemarks, setIncludeRemarks] = useState(true);
  const [includeComments, setIncludeComments] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadGrades();
    }
  }, [user?.id, academicYear, semester, selectedTeacher, selectedSubject]);

  const loadGrades = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const filter = {
        academic_year: academicYear || undefined,
        semester: semester || undefined,
        teacher_id: selectedTeacher || undefined,
        subject_id: selectedSubject || undefined
      };

      const gradeData = await gradeService.getStudentGrades(filter);
      setGrades(gradeData);

      // Extract unique values for filters
      const years = new Set<string>();
      const semesters = new Set<string>();
      const teachers = new Map<string, string>();
      const subjects = new Map<string, { code: string; name: string }>();

      gradeData.forEach(grade => {
        if (grade.academic_year) years.add(grade.academic_year);
        if (grade.semester) semesters.add(grade.semester);
        if (grade.teacher_id && grade.teacher_name) {
          teachers.set(grade.teacher_id, grade.teacher_name);
        }
        if (grade.subject_id && grade.subject_code && grade.subject_name) {
          subjects.set(grade.subject_id, {
            code: grade.subject_code,
            name: grade.subject_name
          });
        }
      });

      setAvailableYears(Array.from(years).sort().reverse());
      setAvailableSemesters(Array.from(semesters).sort());
      setAvailableTeachers(
        Array.from(teachers.entries()).map(([id, name]) => ({ id, name }))
      );
      setAvailableSubjects(
        Array.from(subjects.entries()).map(([id, { code, name }]) => ({
          id,
          code,
          name
        }))
      );

      // Set default values if not already set
      if (!academicYear && years.size > 0) {
        setAcademicYear(Array.from(years).sort().reverse()[0]);
      }
      if (!semester && semesters.size > 0) {
        setSemester(Array.from(semesters).sort()[0]);
      }
    } catch (err) {
      setError('Failed to load grades');
      console.error('Error loading grades:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!academicYear || !semester) {
      toast.error('Please select academic year and semester');
      return;
    }

    try {
      setExporting(true);

      const options: GradeExportOptions = {
        format: exportFormat,
        academic_year: academicYear,
        semester: semester,
        teacher_id: selectedTeacher || undefined,
        subject_id: selectedSubject || undefined,
        include_remarks: includeRemarks,
        include_comments: includeComments
      };

      const blob = await gradeService.exportGrades(options);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `grades_${academicYear}_${semester}.${exportFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Grades exported successfully');
      setExportDialog(false);
    } catch (err) {
      toast.error('Failed to export grades');
      console.error('Error exporting grades:', err);
    } finally {
      setExporting(false);
    }
  };

  const getGradeColor = (grade?: number) => {
    if (grade === undefined) return 'default';
    if (grade >= 75) return 'success';
    if (grade >= 65) return 'warning';
    return 'error';
  };

  const getStatusChip = (status: string) => {
    const statusProps = {
      submitted: { color: 'info' as const, label: 'Submitted' },
      approved: { color: 'success' as const, label: 'Approved' },
      rejected: { color: 'error' as const, label: 'Rejected' },
      pending: { color: 'warning' as const, label: 'Pending' }
    };

    const props = statusProps[status as keyof typeof statusProps] || { color: 'default' as const, label: status };
    return <Chip size="small" color={props.color} label={props.label} />;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          Grade Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={() => setExportDialog(true)}
          disabled={grades.length === 0}
        >
          Export Grades
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Academic Year</InputLabel>
            <Select
              value={academicYear}
              label="Academic Year"
              onChange={(e) => setAcademicYear(e.target.value)}
            >
              {availableYears.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Semester</InputLabel>
            <Select
              value={semester}
              label="Semester"
              onChange={(e) => setSemester(e.target.value)}
            >
              {availableSemesters.map((sem) => (
                <MenuItem key={sem} value={sem}>
                  {sem}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Teacher</InputLabel>
            <Select
              value={selectedTeacher}
              label="Teacher"
              onChange={(e) => setSelectedTeacher(e.target.value)}
            >
              <MenuItem value="">All Teachers</MenuItem>
              {availableTeachers.map((teacher) => (
                <MenuItem key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Subject</InputLabel>
            <Select
              value={selectedSubject}
              label="Subject"
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <MenuItem value="">All Subjects</MenuItem>
              {availableSubjects.map((subject) => (
                <MenuItem key={subject.id} value={subject.id}>
                  {subject.code} - {subject.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student ID</TableCell>
                  <TableCell>Student Name</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Teacher</TableCell>
                  <TableCell align="center">Prelim</TableCell>
                  <TableCell align="center">Midterm</TableCell>
                  <TableCell align="center">Final</TableCell>
                  <TableCell align="center">Final Grade</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell>Remarks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {grades.map((grade) => (
                  <TableRow key={`${grade.student_id}-${grade.subject_code}`}>
                    <TableCell>{grade.student_id}</TableCell>
                    <TableCell>{grade.student_name}</TableCell>
                    <TableCell>
                      {grade.subject_code} - {grade.subject_name}
                    </TableCell>
                    <TableCell>{grade.teacher_name}</TableCell>
                    <TableCell align="center">
                      <Chip
                        size="small"
                        color={getGradeColor(grade.prelim_grade)}
                        label={grade.prelim_grade?.toFixed(2) || '-'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        size="small"
                        color={getGradeColor(grade.midterm_grade)}
                        label={grade.midterm_grade?.toFixed(2) || '-'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        size="small"
                        color={getGradeColor(grade.final_grade)}
                        label={grade.final_grade?.toFixed(2) || '-'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        size="small"
                        color={getGradeColor(grade.final_computed_grade)}
                        label={grade.final_computed_grade?.toFixed(2) || '-'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {getStatusChip(grade.status)}
                    </TableCell>
                    <TableCell>{grade.remarks || '-'}</TableCell>
                  </TableRow>
                ))}
                {grades.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} align="center">
                      No grades available for the selected filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Export Dialog */}
      <Dialog
        open={exportDialog}
        onClose={() => !exporting && setExportDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Export Grades</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Export Format</InputLabel>
              <Select
                value={exportFormat}
                label="Export Format"
                onChange={(e) => setExportFormat(e.target.value as 'csv' | 'pdf')}
              >
                <MenuItem value="csv">CSV</MenuItem>
                <MenuItem value="pdf">PDF</MenuItem>
              </Select>
            </FormControl>

            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeRemarks}
                    onChange={(e) => setIncludeRemarks(e.target.checked)}
                  />
                }
                label="Include Remarks"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeComments}
                    onChange={(e) => setIncludeComments(e.target.checked)}
                  />
                }
                label="Include Comments"
              />
            </FormGroup>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setExportDialog(false)}
            disabled={exporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            variant="contained"
            disabled={exporting}
          >
            {exporting ? 'Exporting...' : 'Export'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 