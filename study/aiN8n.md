---
title: n8n Workflow Automation
permalink: /study/aiN8n
---

# n8n Workflow Automation {#n8n-workflow-automation}

The official documentation is a really good starting point: [n8n Build an Ai workflow in n8n](https://docs.n8n.io/advanced-ai/intro-tutorial/). This page is me exploring how it works and adding useful links. 


How are you loading to parquet?

all I am seeing its a fast 
2025-10-04 19:35:53 INFO dataviation.research - [traffic/Oceania/PremiumEco_Oceania_201401-202407.csv] Reading CSV 87/88: /Users/garylu/Documents/Repositories/DatAviation-UNSW-DataAnalysis/data/processed/traffic/Oceania/PremiumEco_Oceania_201401-202407.csv
2025-10-04 19:35:53,609 - INFO - research.py:388 - [traffic/Oceania/PremiumEco_Oceania_201401-202407.csv] Reading CSV 87/88: /Users/garylu/Documents/Repositories/DatAviation-UNSW-DataAnalysis/data/processed/traffic/Oceania/PremiumEco_Oceania_201401-202407.csv
2025-10-04 19:35:53 INFO dataviation.research - [traffic/Oceania/PremiumEco_Oceania_202407-202504.csv] Reading CSV 88/88: /Users/garylu/Documents/Repositories/DatAviation-UNSW-DataAnalysis/data/processed/traffic/Oceania/PremiumEco_Oceania_202407-202504.csv
2025-10-04 19:35:53,615 - INFO - research.py:388 - [traffic/Oceania/PremiumEco_Oceania_202407-202504.csv] Reading CSV 88/88: /Users/garylu/Documents/Repositories/DatAviation-UNSW-DataAnalysis/data/processed/traffic/Oceania/PremiumEco_Oceania_202407-202504.csv

read messages, then its just waiting

Are you loading it one by one or bulk to memory

You should do it one by one, that way you can you multi worker? 

I did similar for transofmrer if you see base_etl.py

def process(
        self,
        input_file: Optional[Path] = None,
        output_dir: Optional[Path] = None,
        return_mapping: bool = False,
        region_flag: bool = False,
    ) -> Union[Path, Dict[str, str]]:
        """
        Run the complete raw data processing workflow using multithreading.
        Each input file is processed independently and saved to its own output file.

        Args:
            input_file: Optional path to a specific file to process. If not provided,
                       processes all files in the raw data directory.
            output_dir: Optional path to a directory to save processed files. If not provided,
                       uses the processed data directory from the raw processor.
            return_mapping: If True, returns a dictionary mapping input files to output files.
                          If False, returns a single path (for backward compatibility).
            region_flag: If True, process files in region-specific subdirectories.

        Returns:
            Either a single Path to the processed file (if return_mapping=False) or
            a dictionary mapping input file paths to their corresponding output file paths (if return_mapping=True)
        """
        try:
            # Get list of files to process
            if input_file is not None:
                if not input_file.exists():
                    raise ValueError(f"Input file not found: {input_file}")
                files_to_process = [input_file]
            else:
                # Get all files with the correct suffix from the raw directory
                if not region_flag:
                    files_to_process = list(
                        self.raw_dir.glob(f"*{self.get_file_suffix()}")
                    )
                else:
                    files_to_process = []
                    for region in REGION_LIST:
                        files_to_process.extend(
                            list(
                                self.raw_dir.glob(f"{region}/*{self.get_file_suffix()}")
                            )
                        )
                if not files_to_process:
                    raise ValueError(
                        f"No raw {self.get_data_type()} data files found in {self.raw_dir}. "
                        "Please download files first using 'download raw' command."
                    )

            # Get the processing function
            process_func = self.get_process_function()

            # Process files concurrently using ThreadPoolExecutor
            max_workers = config.config.max_workers
            logger.info(
                f"[process] Processing {len(files_to_process)} files using {max_workers} workers"
            )

            # Dictionary to store input to output file mappings
            file_mappings: Dict[str, str] = {}

            with ProcessPoolExecutor(max_workers=max_workers) as executor:
                future_to_file = {
                    executor.submit(
                        process_func,
                        str(file_path),
                        str(self.processed_dir if not output_dir else output_dir),
                        self.get_required_schema(),
                    ): file_path
                    for file_path in files_to_process
                }

                with tqdm(total=len(future_to_file), desc="Processing files") as pbar:
                    for future in concurrent.futures.as_completed(future_to_file):
                        input_path = future_to_file[future]
                        try:
                            output_path = future.result()
                            file_mappings[input_path.stem] = output_path
                        except Exception as e:
                            logger.error(
                                f"[process] Error processing {input_path}: {e}"
                            )
                            raise
                        finally:
                            pbar.update(1)

            if not file_mappings:
                raise ValueError("No files were successfully processed")

            # Return either a single path (for backward compatibility) or the full mapping
            if not return_mapping and len(file_mappings) == 1:
                return Path(list(file_mappings.values())[0])
            elif not return_mapping:
                raise ValueError("Multiple files processed but return_mapping=False")
            else:
                return file_mappings

        except Exception as e:
            # Get the full traceback with line numbers
            tb = traceback.format_exc()
            logger.error(f"[process] Raw data processing failed:\n{tb}")
            raise