import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { 
  DollarSign, 
  Search, 
  Filter, 
  Calendar, 
  Award, 
  BookOpen,
  GraduationCap,
  Users,
  MapPin,
  Clock,
  Star,
  ExternalLink,
  Calculator,
  TrendingUp,
  Target,
  CheckCircle,
  AlertCircle,
  Info,
  Download,
  Share,
  Heart,
  Bookmark,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  IndianRupee,
  Building,
  Globe,
  Phone,
  Mail,
  FileText,
  User,
  School,
  Briefcase
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { toast } from 'sonner@2.0.3';

interface Scholarship {
  id: string;
  name: string;
  provider: string;
  amount: number;
  currency: string;
  type: 'merit' | 'need' | 'sports' | 'minority' | 'disability' | 'other';
  category: 'undergraduate' | 'postgraduate' | 'phd' | 'diploma' | 'certificate';
  field: string[];
  eligibility: {
    minAge?: number;
    maxAge?: number;
    minPercentage?: number;
    maxIncome?: number;
    gender?: string;
    nationality: string;
    state?: string[];
    caste?: string[];
    disability?: boolean;
    sports?: string[];
  };
  applicationDeadline: string;
  applicationStart: string;
  description: string;
  benefits: string[];
  documents: string[];
  applicationProcess: string[];
  contactInfo: {
    email: string;
    phone: string;
    website: string;
    address: string;
  };
  isActive: boolean;
  popularity: number;
  difficulty: 'easy' | 'medium' | 'hard';
  successRate: number;
  tags: string[];
}

interface LoanOption {
  id: string;
  bank: string;
  name: string;
  interestRate: number;
  maxAmount: number;
  tenure: number;
  processingFee: number;
  prepaymentCharges: number;
  eligibility: {
    minAge: number;
    maxAge: number;
    minIncome: number;
    coApplicant: boolean;
    collateral: boolean;
  };
  features: string[];
  documents: string[];
  applicationProcess: string[];
  contactInfo: {
    email: string;
    phone: string;
    website: string;
  };
  rating: number;
  reviews: number;
}

interface FinancialCalculator {
  totalCost: number;
  familyIncome: number;
  savings: number;
  scholarshipAmount: number;
  loanAmount: number;
  monthlyEMI: number;
  totalInterest: number;
  repaymentPeriod: number;
}

export function FinancialAidFinder() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loans, setLoans] = useState<LoanOption[]>([]);
  const [filteredScholarships, setFilteredScholarships] = useState<Scholarship[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<LoanOption[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedField, setSelectedField] = useState('all');
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculator, setCalculator] = useState<FinancialCalculator>({
    totalCost: 0,
    familyIncome: 0,
    savings: 0,
    scholarshipAmount: 0,
    loanAmount: 0,
    monthlyEMI: 0,
    totalInterest: 0,
    repaymentPeriod: 0
  });
  const [savedScholarships, setSavedScholarships] = useState<string[]>([]);
  const [appliedScholarships, setAppliedScholarships] = useState<string[]>([]);

  // Sample data
  const sampleScholarships: Scholarship[] = [
    {
      id: '1',
      name: 'National Merit Scholarship',
      provider: 'Government of India',
      amount: 100000,
      currency: 'INR',
      type: 'merit',
      category: 'undergraduate',
      field: ['Engineering', 'Medicine', 'Science', 'Commerce', 'Arts'],
      eligibility: {
        minAge: 17,
        maxAge: 25,
        minPercentage: 85,
        maxIncome: 800000,
        nationality: 'Indian',
        state: ['All'],
        caste: ['All']
      },
      applicationDeadline: '2024-03-31',
      applicationStart: '2024-01-01',
      description: 'Merit-based scholarship for outstanding students pursuing higher education.',
      benefits: [
        'Full tuition fee coverage',
        'Monthly stipend of ₹5,000',
        'Book allowance of ₹10,000 per year',
        'Laptop/tablet allowance'
      ],
      documents: [
        'Class 12 mark sheet',
        'Income certificate',
        'Caste certificate (if applicable)',
        'Bank account details',
        'Passport size photographs'
      ],
      applicationProcess: [
        'Register on the official portal',
        'Fill the application form',
        'Upload required documents',
        'Submit application before deadline',
        'Appear for interview (if shortlisted)'
      ],
      contactInfo: {
        email: 'scholarship@gov.in',
        phone: '+91-11-23456789',
        website: 'https://scholarships.gov.in',
        address: 'Ministry of Education, New Delhi'
      },
      isActive: true,
      popularity: 95,
      difficulty: 'hard',
      successRate: 15,
      tags: ['Government', 'Merit-based', 'High Amount']
    },
    {
      id: '2',
      name: 'SC/ST Post Matric Scholarship',
      provider: 'Ministry of Social Justice',
      amount: 50000,
      currency: 'INR',
      type: 'minority',
      category: 'undergraduate',
      field: ['All'],
      eligibility: {
        minAge: 16,
        maxAge: 30,
        minPercentage: 50,
        maxIncome: 250000,
        nationality: 'Indian',
        caste: ['SC', 'ST']
      },
      applicationDeadline: '2024-04-15',
      applicationStart: '2024-02-01',
      description: 'Scholarship for SC/ST students pursuing post-matriculation courses.',
      benefits: [
        'Tuition fee reimbursement',
        'Maintenance allowance',
        'Book allowance',
        'Other allowances as per norms'
      ],
      documents: [
        'Caste certificate',
        'Income certificate',
        'Mark sheets',
        'Admission proof',
        'Bank account details'
      ],
      applicationProcess: [
        'Apply through state portal',
        'Submit required documents',
        'Get verification from college',
        'Submit to district office'
      ],
      contactInfo: {
        email: 'scst@socialjustice.nic.in',
        phone: '+91-11-23456790',
        website: 'https://socialjustice.nic.in',
        address: 'Ministry of Social Justice, New Delhi'
      },
      isActive: true,
      popularity: 85,
      difficulty: 'medium',
      successRate: 60,
      tags: ['Government', 'SC/ST', 'Post Matric']
    },
    {
      id: '3',
      name: 'Sports Excellence Scholarship',
      provider: 'Sports Authority of India',
      amount: 75000,
      currency: 'INR',
      type: 'sports',
      category: 'undergraduate',
      field: ['All'],
      eligibility: {
        minAge: 16,
        maxAge: 25,
        minPercentage: 60,
        nationality: 'Indian',
        sports: ['Cricket', 'Football', 'Badminton', 'Tennis', 'Athletics']
      },
      applicationDeadline: '2024-05-31',
      applicationStart: '2024-03-01',
      description: 'Scholarship for students who excel in sports and maintain good academic performance.',
      benefits: [
        'Annual scholarship of ₹75,000',
        'Sports equipment allowance',
        'Training support',
        'Competition participation support'
      ],
      documents: [
        'Sports achievement certificates',
        'Medical fitness certificate',
        'Academic mark sheets',
        'Recommendation from coach',
        'Bank account details'
      ],
      applicationProcess: [
        'Register on SAI portal',
        'Submit sports achievements',
        'Get recommendation from coach',
        'Submit application with documents'
      ],
      contactInfo: {
        email: 'scholarship@sai.nic.in',
        phone: '+91-11-23456791',
        website: 'https://sai.nic.in',
        address: 'Sports Authority of India, New Delhi'
      },
      isActive: true,
      popularity: 70,
      difficulty: 'medium',
      successRate: 40,
      tags: ['Sports', 'Government', 'Excellence']
    }
  ];

  const sampleLoans: LoanOption[] = [
    {
      id: '1',
      bank: 'State Bank of India',
      name: 'SBI Student Loan',
      interestRate: 8.5,
      maxAmount: 2000000,
      tenure: 15,
      processingFee: 10000,
      prepaymentCharges: 2,
      eligibility: {
        minAge: 18,
        maxAge: 35,
        minIncome: 150000,
        coApplicant: true,
        collateral: false
      },
      features: [
        'No collateral required',
        'Flexible repayment options',
        'Interest subsidy available',
        'Quick processing'
      ],
      documents: [
        'Admission letter',
        'Fee structure',
        'Income proof',
        'Identity proof',
        'Address proof'
      ],
      applicationProcess: [
        'Apply online or visit branch',
        'Submit required documents',
        'Get approval',
        'Sign loan agreement',
        'Receive disbursement'
      ],
      contactInfo: {
        email: 'studentloan@sbi.co.in',
        phone: '+91-22-23456789',
        website: 'https://sbi.co.in'
      },
      rating: 4.5,
      reviews: 1250
    },
    {
      id: '2',
      bank: 'HDFC Bank',
      name: 'HDFC Education Loan',
      interestRate: 9.0,
      maxAmount: 1500000,
      tenure: 12,
      processingFee: 15000,
      prepaymentCharges: 3,
      eligibility: {
        minAge: 18,
        maxAge: 30,
        minIncome: 200000,
        coApplicant: true,
        collateral: true
      },
      features: [
        'Competitive interest rates',
        'No prepayment charges after 1 year',
        'Flexible EMI options',
        'Online application'
      ],
      documents: [
        'Admission letter',
        'Fee structure',
        'Income proof',
        'Property documents',
        'Identity proof'
      ],
      applicationProcess: [
        'Apply online',
        'Submit documents',
        'Property valuation',
        'Get approval',
        'Disbursement'
      ],
      contactInfo: {
        email: 'education@hdfcbank.com',
        phone: '+91-22-23456790',
        website: 'https://hdfcbank.com'
      },
      rating: 4.3,
      reviews: 980
    }
  ];

  useEffect(() => {
    setScholarships(sampleScholarships);
    setLoans(sampleLoans);
    setFilteredScholarships(sampleScholarships);
    setFilteredLoans(sampleLoans);
  }, []);

  useEffect(() => {
    let filtered = scholarships;

    if (searchTerm) {
      filtered = filtered.filter(scholarship =>
        scholarship.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scholarship.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scholarship.field.some(field => field.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(scholarship => scholarship.type === selectedType);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(scholarship => scholarship.category === selectedCategory);
    }

    if (selectedField !== 'all') {
      filtered = filtered.filter(scholarship => 
        scholarship.field.includes(selectedField) || scholarship.field.includes('All')
      );
    }

    setFilteredScholarships(filtered);
  }, [scholarships, searchTerm, selectedType, selectedCategory, selectedField]);

  const calculateEMI = (principal: number, rate: number, tenure: number) => {
    const monthlyRate = rate / 12 / 100;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure * 12)) / 
                (Math.pow(1 + monthlyRate, tenure * 12) - 1);
    return emi;
  };

  const handleCalculatorUpdate = () => {
    const loanAmount = calculator.totalCost - calculator.savings - calculator.scholarshipAmount;
    const monthlyEMI = calculateEMI(loanAmount, 9, 10); // Assuming 9% interest and 10 years
    const totalInterest = (monthlyEMI * 12 * 10) - loanAmount;

    setCalculator({
      ...calculator,
      loanAmount: Math.max(0, loanAmount),
      monthlyEMI,
      totalInterest,
      repaymentPeriod: 10
    });
  };

  const saveScholarship = (scholarshipId: string) => {
    if (savedScholarships.includes(scholarshipId)) {
      setSavedScholarships(savedScholarships.filter(id => id !== scholarshipId));
      toast.success('Scholarship removed from saved list');
    } else {
      setSavedScholarships([...savedScholarships, scholarshipId]);
      toast.success('Scholarship saved successfully');
    }
  };

  const applyForScholarship = (scholarshipId: string) => {
    if (appliedScholarships.includes(scholarshipId)) {
      toast.info('You have already applied for this scholarship');
    } else {
      setAppliedScholarships([...appliedScholarships, scholarshipId]);
      toast.success('Application submitted successfully');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'merit': return 'bg-blue-100 text-blue-800';
      case 'need': return 'bg-green-100 text-green-800';
      case 'sports': return 'bg-orange-100 text-orange-800';
      case 'minority': return 'bg-purple-100 text-purple-800';
      case 'disability': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const scholarshipTypes = ['all', 'merit', 'need', 'sports', 'minority', 'disability', 'other'];
  const categories = ['all', 'undergraduate', 'postgraduate', 'phd', 'diploma', 'certificate'];
  const fields = ['all', 'Engineering', 'Medicine', 'Science', 'Commerce', 'Arts', 'Law', 'Management'];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Aid Finder</h1>
          <p className="text-muted-foreground mt-1">
            Discover scholarships, loans, and financial assistance for your education
          </p>
        </div>
        <Button onClick={() => setShowCalculator(true)}>
          <Calculator className="h-4 w-4 mr-2" />
          Financial Calculator
        </Button>
      </div>

      <Tabs defaultValue="scholarships" className="space-y-6">
        <TabsList>
          <TabsTrigger value="scholarships">Scholarships</TabsTrigger>
          <TabsTrigger value="loans">Education Loans</TabsTrigger>
          <TabsTrigger value="calculator">Financial Calculator</TabsTrigger>
          <TabsTrigger value="saved">Saved Items</TabsTrigger>
        </TabsList>

        {/* Scholarships Tab */}
        <TabsContent value="scholarships" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search scholarships..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {scholarshipTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedField} onValueChange={setSelectedField}>
                  <SelectTrigger>
                    <SelectValue placeholder="Field" />
                  </SelectTrigger>
                  <SelectContent>
                    {fields.map(field => (
                      <SelectItem key={field} value={field}>
                        {field === 'all' ? 'All Fields' : field}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Scholarships Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredScholarships.map(scholarship => (
              <Card key={scholarship.id} className="hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{scholarship.name}</CardTitle>
                      <CardDescription className="mt-1">{scholarship.provider}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getTypeColor(scholarship.type)}>
                        {scholarship.type}
                      </Badge>
                      <Badge className={getDifficultyColor(scholarship.difficulty)}>
                        {scholarship.difficulty}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        ₹{scholarship.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">Annual amount</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                      <p className="font-medium">{scholarship.successRate}%</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Eligibility:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      {scholarship.eligibility.minPercentage && (
                        <p>Min %: {scholarship.eligibility.minPercentage}%</p>
                      )}
                      {scholarship.eligibility.maxIncome && (
                        <p>Max Income: ₹{scholarship.eligibility.maxIncome.toLocaleString()}</p>
                      )}
                      {scholarship.eligibility.minAge && (
                        <p>Age: {scholarship.eligibility.minAge}-{scholarship.eligibility.maxAge} years</p>
                      )}
                      <p>Nationality: {scholarship.eligibility.nationality}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Deadline: {new Date(scholarship.applicationDeadline).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{scholarship.popularity}%</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => applyForScholarship(scholarship.id)}
                      disabled={appliedScholarships.includes(scholarship.id)}
                    >
                      {appliedScholarships.includes(scholarship.id) ? 'Applied' : 'Apply Now'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => saveScholarship(scholarship.id)}
                    >
                      {savedScholarships.includes(scholarship.id) ? (
                        <Heart className="h-3 w-3 fill-red-500 text-red-500" />
                      ) : (
                        <Heart className="h-3 w-3" />
                      )}
                    </Button>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Loans Tab */}
        <TabsContent value="loans" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredLoans.map(loan => (
              <Card key={loan.id} className="hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{loan.name}</CardTitle>
                      <CardDescription className="mt-1">{loan.bank}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{loan.rating}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">({loan.reviews} reviews)</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Interest Rate</p>
                      <p className="text-xl font-bold text-blue-600">{loan.interestRate}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Max Amount</p>
                      <p className="text-xl font-bold">₹{loan.maxAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tenure</p>
                      <p className="font-medium">{loan.tenure} years</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Processing Fee</p>
                      <p className="font-medium">₹{loan.processingFee.toLocaleString()}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Key Features:</p>
                    <div className="flex flex-wrap gap-1">
                      {loan.features.slice(0, 3).map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      Apply Now
                    </Button>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Financial Calculator Tab */}
        <TabsContent value="calculator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Calculator</CardTitle>
                <CardDescription>Calculate your education funding needs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Total Education Cost (₹)</label>
                  <Input
                    type="number"
                    value={calculator.totalCost}
                    onChange={(e) => setCalculator({...calculator, totalCost: parseInt(e.target.value) || 0})}
                    placeholder="Enter total cost"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Family Annual Income (₹)</label>
                  <Input
                    type="number"
                    value={calculator.familyIncome}
                    onChange={(e) => setCalculator({...calculator, familyIncome: parseInt(e.target.value) || 0})}
                    placeholder="Enter family income"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Available Savings (₹)</label>
                  <Input
                    type="number"
                    value={calculator.savings}
                    onChange={(e) => setCalculator({...calculator, savings: parseInt(e.target.value) || 0})}
                    placeholder="Enter savings"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Expected Scholarship (₹)</label>
                  <Input
                    type="number"
                    value={calculator.scholarshipAmount}
                    onChange={(e) => setCalculator({...calculator, scholarshipAmount: parseInt(e.target.value) || 0})}
                    placeholder="Enter scholarship amount"
                  />
                </div>

                <Button onClick={handleCalculatorUpdate} className="w-full">
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Calculation Results</CardTitle>
                <CardDescription>Your education funding breakdown</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Cost</span>
                    <span className="font-medium">₹{calculator.totalCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Available Savings</span>
                    <span className="font-medium text-green-600">-₹{calculator.savings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Scholarship Amount</span>
                    <span className="font-medium text-green-600">-₹{calculator.scholarshipAmount.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Loan Required</span>
                      <span className="font-bold text-red-600">₹{calculator.loanAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {calculator.loanAmount > 0 && (
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Monthly EMI</span>
                      <span className="font-medium">₹{Math.round(calculator.monthlyEMI).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Interest</span>
                      <span className="font-medium">₹{Math.round(calculator.totalInterest).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Repayment Period</span>
                      <span className="font-medium">{calculator.repaymentPeriod} years</span>
                    </div>
                  </div>
                )}

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    This is an estimate. Actual loan terms may vary based on your credit profile and bank policies.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Saved Items Tab */}
        <TabsContent value="saved" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {savedScholarships.map(scholarshipId => {
              const scholarship = scholarships.find(s => s.id === scholarshipId);
              if (!scholarship) return null;

              return (
                <Card key={scholarshipId} className="hover:shadow-lg transition-all duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{scholarship.name}</CardTitle>
                        <CardDescription className="mt-1">{scholarship.provider}</CardDescription>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => saveScholarship(scholarshipId)}
                      >
                        <Heart className="h-3 w-3 fill-red-500 text-red-500" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-green-600">
                          ₹{scholarship.amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">Annual amount</p>
                      </div>
                      <Badge className={getTypeColor(scholarship.type)}>
                        {scholarship.type}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Deadline: {new Date(scholarship.applicationDeadline).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{scholarship.popularity}%</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => applyForScholarship(scholarshipId)}
                        disabled={appliedScholarships.includes(scholarshipId)}
                      >
                        {appliedScholarships.includes(scholarshipId) ? 'Applied' : 'Apply Now'}
                      </Button>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {savedScholarships.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No saved items</h3>
                <p className="text-muted-foreground">
                  Save scholarships and loans to view them here
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
