import os
from typing import List, Dict, Any

SAMPLE_DOCS = [
    {
        "title": "Principles of Operating Systems: Concurrency & Synchronization",
        "filename": "operating_systems_concurrency.txt",
        "subject": "Computer Science & Engineering",
        "file_type": "txt",
        "content": """Chapter 1: Process Synchronization and Race Conditions
Process synchronization refers to the coordination of simultaneous processes to ensure orderly execution and data consistency. When multiple concurrent processes execute and access shared resources asynchronously, a race condition may occur. A race condition is defined as an undesirable situation that occurs when a system attempts to perform two or more operations at the same time, but because of the nature of the system, the operations must be done in the proper sequence to be done correctly. 

The Critical Section Problem is a fundamental challenge in concurrent programming. A critical section is a code segment that accesses shared variables or resources that must not be accessed concurrently by more than one thread of execution. Any valid solution to the critical section problem must satisfy three strict requirements:
1. Mutual Exclusion: If process Pi is executing in its critical section, then no other processes can be executing in their critical sections.
2. Progress: If no process is executing in its critical section and some processes wish to enter their critical sections, only those processes not executing in their remainder sections can participate in deciding which will enter next.
3. Bounded Waiting: There must be a bound or limit on the number of times other processes are allowed to enter their critical sections after a process has made a request to enter and before that request is granted.

Chapter 2: Semaphores, Mutexes, and Monitors
A Semaphore is an integer synchronization variable initialized to an integer value, which, apart from initialization, is accessed only through two standard atomic operations: wait() and signal() (originally known as P and V operations). 
The wait operation is defined as:
wait(S) { while (S <= 0); S--; }
The signal operation is defined as:
signal(S) { S++; }

Counting semaphores can be used to control access to a given resource consisting of a finite number of instances. Binary semaphores, also known as mutex locks, can take integer values only between 0 and 1, providing mutual exclusion for exclusive resources.

A monitor is a high-level synchronization construct that encapsulates shared variables, procedures, and condition variables within an abstract data type. Condition variables in monitors support two primary operations: wait() and signal(). If a thread invokes x.wait(), it is suspended until another thread calls x.signal().

Chapter 3: Deadlock Characterization and Prevention
A Deadlock is defined as a state in which each process in a set of processes is waiting for an event that only another process in the set can cause. 
For a deadlock to arise, all four of the Coffman conditions must hold simultaneously:
1. Mutual Exclusion: At least one resource must be held in a non-shareable mode.
2. Hold and Wait: A process must be currently holding at least one resource and requesting additional resources that are currently being held by other processes.
3. No Preemption: Resources cannot be preempted; a resource can be released only voluntarily by the process holding it after that process has completed its task.
4. Circular Wait: A closed chain of processes exists such that each process holds at least one resource needed by the next process in the chain.

Banker's Algorithm, developed by Edsger Dijkstra, is a classic deadlock avoidance algorithm designed for systems with multiple instances of each resource type. It tests for safety by simulating the allocation for predetermined maximum possible amounts of all resources, and then makes an s-state check to see if pending activities should be allowed to proceed.
The Resource Allocation Graph (RAG) is a directed graph used to detect deadlocks. If a RAG contains no cycles, no deadlock exists. If the graph contains a cycle and each resource type has only one instance, a deadlock definitely exists.

Amdahl's Law quantifies the theoretical speedup in latency of the execution of a task at fixed workload that can be expected of a system whose resources are improved:
Speedup = 1 / ((1 - P) + (P / S))
where P is the proportion of parallelizable code, and S is the speedup factor of that parallel portion."""
    },
    {
        "title": "Molecular Biology: Genetics, Transcription, and Translation",
        "filename": "molecular_biology_genetics.txt",
        "subject": "Biotechnology & Medicine",
        "file_type": "txt",
        "content": """Chapter 1: The Central Dogma and DNA Architecture
The Central Dogma of molecular biology, first enunciated by Francis Crick in 1958, articulates the directional flow of genetic information within a biological system: DNA is transcribed into messenger RNA (mRNA), and mRNA is subsequently translated into functional polypeptide chains and proteins. 
Deoxyribonucleic acid (DNA) is a double-stranded antiparallel helical macromolecule composed of nucleotide units. Each nucleotide comprises a nitrogenous base, a five-carbon deoxyribose sugar, and a phosphate group. 
According to Chargaff's rules of base pairing:
- Adenine (A) pairs specifically with Thymine (T) via two hydrogen bonds.
- Guanine (G) pairs with Cytosine (C) via three hydrogen bonds.
Because of this specific complementary base pairing, the ratio of purines (A + G) to pyrimidines (T + C) in double-stranded genomic DNA is consistently 1:1.

Chapter 2: DNA Replication Mechanisms
DNA replication is semiconservative, meaning each newly synthesized duplex contains one conserved parental strand and one newly synthesized daughter strand, as definitively proven by Matthew Meselson and Franklin Stahl in 1958.
The replication fork requires a coordinated multi-enzyme complex:
1. DNA Helicase: Unwinds the double helix by breaking hydrogen bonds between base pairs.
2. Single-Stranded DNA-Binding Proteins (SSBs): Stabilize exposed single strands and prevent premature re-annealing.
3. DNA Topoisomerase (Gyrase): Relieves torsional strain and supercoiling downstream of the replication fork.
4. Primase: Synthesizes short complementary RNA primers necessary for initiating chain elongation.
5. DNA Polymerase III: Catalyzes phosphodiester bond formation exclusively in the 5' to 3' direction.
Because DNA synthesis occurs strictly 5' to 3', synthesis on the leading strand occurs continuously, whereas synthesis on the lagging strand proceeds discontinuously, generating short Okazaki fragments that are covalently joined by DNA Ligase.

Chapter 3: Transcription, RNA Processing, and Translation
Transcription is the biological process wherein the genetic code contained within DNA is transcribed into an RNA transcript by RNA Polymerase. In eukaryotic organisms, pre-mRNA undergoes three crucial post-transcriptional modifications before nuclear export:
1. 5' Capping: Addition of 7-methylguanosine to protect against exonucleases.
2. 3' Polyadenylation: Addition of a poly(A) tail of 150-250 adenine residues to ensure stability.
3. Splicing: Removal of non-coding introns and covalent ligation of coding exons by the spliceosome.

Translation occurs on ribosomes and interprets codons (triplet nucleotide sequences). The standard genetic code consists of 64 codons, where 61 specify amino acids and 3 act as stop codons (UAA, UAG, UGA). The universal start codon is AUG, encoding Methionine."""
    }
]

# Curated reference Human questions for blind comparison benchmarks
SAMPLE_HUMAN_QUESTIONS = [
    {
        "question_type": "mcq",
        "question_text": "Which of the following conditions is NOT one of the four Coffman conditions necessary for a system deadlock to arise?",
        "options": [
            "Mutual Exclusion",
            "Hold and Wait",
            "Preemptive Scheduling",
            "Circular Wait"
        ],
        "marks": 1,
        "difficulty": "Medium",
        "correct_answer": "C",
        "explanation": "Preemptive scheduling prevents deadlocks; the required Coffman condition is 'No Preemption', meaning resources cannot be forcibly seized.",
        "blooms_level": "Remember",
        "origin": "human",
        "anonymous_id": "EVAL-H8121"
    },
    {
        "question_type": "mcq",
        "question_text": "During DNA replication, which enzyme is directly responsible for joining the Okazaki fragments formed on the lagging strand?",
        "options": [
            "DNA Helicase",
            "DNA Ligase",
            "RNA Primase",
            "Topoisomerase"
        ],
        "marks": 1,
        "difficulty": "Easy",
        "correct_answer": "B",
        "explanation": "DNA Ligase catalyzes the formation of covalent phosphodiester bonds between adjacent Okazaki fragments.",
        "blooms_level": "Remember",
        "origin": "human",
        "anonymous_id": "EVAL-H4390"
    },
    {
        "question_type": "short_answer",
        "question_text": "Explain the three essential requirements that any valid algorithmic solution to the Critical Section Problem must satisfy.",
        "options": None,
        "marks": 5,
        "difficulty": "Medium",
        "correct_answer": "Model Answer: 1. Mutual Exclusion ensures no two processes are in their critical sections simultaneously. 2. Progress guarantees that only non-remainder processes participate in entry selection. 3. Bounded Waiting ensures a finite limit on subsequent entries to prevent starvation.",
        "explanation": "Human-authored comprehensive rubric checking mutual exclusion, progress, and bounded waiting.",
        "blooms_level": "Understand",
        "origin": "human",
        "anonymous_id": "EVAL-H9042"
    },
    {
        "question_type": "long_answer",
        "question_text": "Critically analyze the mechanism of the Banker's Algorithm. Under what specific conditions does a state transition from safe to unsafe, and how does the OS ensure deadlock avoidance?",
        "options": None,
        "marks": 10,
        "difficulty": "Hard",
        "correct_answer": "Model Answer: Detail the allocation matrix, max demand, available vector, need matrix (Need = Max - Allocation). Demonstrate that an unsafe state does not guarantee immediate deadlock, but leaves the system vulnerable.",
        "explanation": "Expository 10-mark examination problem evaluating resource allocation safety states.",
        "blooms_level": "Analyze",
        "origin": "human",
        "anonymous_id": "EVAL-H6115"
    }
]
