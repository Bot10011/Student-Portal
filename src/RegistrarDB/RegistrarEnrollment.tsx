import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  TextField,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { toast } from 'react-hot-toast';

interface Student {
  id: string;
  name: string;
  studentType: 'Freshman' | 'Regular' | 'Irregular' | 'Transferee';
  yearLevel: number;
  currentSubjects: Subject[];
  totalUnits: number;
  status: 'pending' | 'approved' | 'returned';
  programHeadApproval: boolean;
  scheduleConflicts: boolean;
  eligibilityIssues: boolean;
}

interface Subject {
  id: string;
  code: string;
  name: string;
  units: number;
  schedule: string;
  instructor: string;
  status: 'pending' | 'approved' | 'removed';
}

const RegistrarEnrollment: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEnrollments();
  }, []);

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call
      const mockData: Student[] = [
        {
          id: '1',
          name: 'John Doe',
          studentType: 'Freshman',
          yearLevel: 1,
          currentSubjects: [],
          totalUnits: 0,
          status: 'pending',
          programHeadApproval: true,
          scheduleConflicts: false,
          eligibilityIssues: false,
        },
        // Add more mock data as needed
      ];
      setStudents(mockData);
    } catch (err) {
      setError('Failed to load enrollments');
      console.error('Error loading enrollments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (student: Student) => {
    setSelectedStudent(student);
    setIsDialogOpen(true);
  };

  const handleApprove = async () => {
    try {
      // TODO: Implement API call
      toast.success('Enrollment finalized successfully');
      setIsDialogOpen(false);
      loadEnrollments();
    } catch (err) {
      toast.error('Failed to finalize enrollment');
      console.error('Error finalizing enrollment:', err);
    }
  };

  const handleReturn = async () => {
    try {
      // TODO: Implement API call
      toast.info('Enrollment returned to Program Head for revision');
      setIsDialogOpen(false);
      loadEnrollments();
    } catch (err) {
      toast.error('Failed to return enrollment');
      console.error('Error returning enrollment:', err);
    }
  };

  const getStudentTypeColor = (type: string) => {
    switch (type) {
      case 'Freshman': return 'primary';
      case 'Regular': return 'success';
      case 'Irregular': return 'warning';
      case 'Transferee': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'returned': return 'error';
      default: return 'default';
    }
  };

  const renderValidationIssues = (student: Student) => {
    const issues = [];
    if (student.scheduleConflicts) {
      issues.push('Schedule conflicts detected');
    }
    if (student.eligibilityIssues) {
      issues.push('Eligibility issues found');
    }
    if (student.totalUnits > 24) {
      issues.push('Total units exceed maximum allowed (24)');
    }
    if (student.totalUnits < 12) {
      issues.push('Total units below minimum required (12)');
    }

    return issues.length > 0 ? (
      <Alert severity="warning" sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Validation Issues
        </Typography>
        <List dense>
          {issues.map((issue, index) => (
            <ListItem key={index}>
              <ListItemText primary={issue} />
            </ListItem>
          ))}
        </List>
      </Alert>
    ) : null;
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
      <Typography variant="h5" gutterBottom>
        Enrollment Final Review
      </Typography>

      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Year Level</TableCell>
                  <TableCell>Total Units</TableCell>
                  <TableCell>Program Head Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.id}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={student.studentType}
                        color={getStudentTypeColor(student.studentType)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{student.yearLevel}</TableCell>
                    <TableCell>{student.totalUnits}</TableCell>
                    <TableCell>
                      <Chip
                        label={student.programHeadApproval ? 'APPROVED' : 'PENDING'}
                        color={student.programHeadApproval ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleReview(student)}
                        disabled={!student.programHeadApproval}
                      >
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Final Enrollment Review</DialogTitle>
        <DialogContent>
          {selectedStudent && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Name"
                    value={selectedStudent.name}
                    fullWidth
                    disabled
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Type"
                    value={selectedStudent.studentType}
                    fullWidth
                    disabled
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Year Level"
                    value={selectedStudent.yearLevel}
                    fullWidth
                    disabled
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Total Units"
                    value={selectedStudent.totalUnits}
                    fullWidth
                    disabled
                    margin="normal"
                  />
                </Grid>
              </Grid>

              {renderValidationIssues(selectedStudent)}

              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Enrolled Subjects
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Code</TableCell>
                      <TableCell>Subject</TableCell>
                      <TableCell>Units</TableCell>
                      <TableCell>Schedule</TableCell>
                      <TableCell>Instructor</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedStudent.currentSubjects.map((subject) => (
                      <TableRow key={subject.id}>
                        <TableCell>{subject.code}</TableCell>
                        <TableCell>{subject.name}</TableCell>
                        <TableCell>{subject.units}</TableCell>
                        <TableCell>{subject.schedule}</TableCell>
                        <TableCell>{subject.instructor}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleReturn} color="warning">
            Return to Program Head
          </Button>
          <Button
            onClick={handleApprove}
            color="primary"
            variant="contained"
            disabled={selectedStudent?.scheduleConflicts || selectedStudent?.eligibilityIssues}
          >
            Finalize Enrollment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RegistrarEnrollment; 